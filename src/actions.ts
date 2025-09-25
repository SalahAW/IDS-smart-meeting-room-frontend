'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth'; // Import your auth function to get server-side session
import axios from 'axios';
import {redirect} from "next/navigation";

/**
 * Defines the shape of the response from server actions.
 */
interface ActionResponse {
    success: boolean;
    message: string;
    user?: any;
    meeting?: any;
    data?: any;
    newName?: string;
}

// The authenticate function remains unchanged.
export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
): Promise<string> {
    try {
        await signIn('credentials', formData);
        return 'Success';
    } catch (error) {
        if (error instanceof AuthError) {
            if (error.cause?.err?.message === 'ConnectionFailed') {
                return 'Server is offline. Please try again later.';
            }
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid credentials. Please check your email and password.';
                default:
                    return 'Something went wrong during authentication.';
            }
        }
        throw error;
    }
}

const getRoleIdFromName = (roleName: string): number => {
    switch (roleName.toLowerCase()) {
        case 'admin': return 1;
        case 'employee': return 2;
        case 'guest': return 3;
        default: return 2;
    }
};

/**
 * Creates authenticated API client
 */
async function createAuthenticatedApiClient() {
    const session = await auth();

    if (!session?.user?.accessToken) {
        throw new Error('Authentication required');
    }

    return axios.create({
        baseURL: 'https://localhost:7032',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.user.accessToken}`,
        },
    });
}

/**
 * Handles the creation of a new user.
 */
export async function createUser(
    prevState: ActionResponse | undefined,
    formData: FormData,
): Promise<ActionResponse> {

    const fullName = formData.get('fullName') as string;
    const email = formData.get('email') as string;
    const role = formData.get('role') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    // Enhanced validation
    if (!fullName?.trim() || !email?.trim() || !role?.trim() || !password?.trim()) {
        return { success: false, message: "All fields are required." };
    }

    if (password !== confirmPassword) {
        return { success: false, message: "Passwords do not match." };
    }

    if (password.length < 6) {
        return { success: false, message: "Password must be at least 6 characters long." };
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { success: false, message: "Please enter a valid email address." };
    }

    const createUserDto = {
        Name: fullName.trim(),
        Email: email.trim().toLowerCase(),
        Password: password,
        RoleId: getRoleIdFromName(role),
    };

    try {
        const apiClient = await createAuthenticatedApiClient();

        console.log('Attempting to create user with payload:', {
            ...createUserDto,
            Password: '[REDACTED]' // Don't log the actual password
        });

        const response = await apiClient.post('/Users', createUserDto);

        console.log('User creation response:', response.data);

        // Revalidate the path on success
        revalidatePath('/dashboard/users');
        return { success: true, message: response.data.Message || "User created successfully!" };

    } catch (error: any) {
        console.error("Create User API Error:", error);
        return handleApiError(error, 'create user');
    }
}

/**
 * Fetches a user by ID
 */
export async function getUserById(userId: string): Promise<ActionResponse> {
    if (!userId || userId.trim() === '') {
        return { success: false, message: "User ID is required." };
    }

    try {
        const apiClient = await createAuthenticatedApiClient();

        console.log(`Fetching user with ID: ${userId}`);

        const response = await apiClient.get(`/Users/${userId}`);

        console.log('Get user response:', response.data);

        return {
            success: true,
            message: response.data.Message || "User fetched successfully!",
            user: response.data.user
        };

    } catch (error: any) {
        console.error("Get User API Error:", error);
        return handleApiError(error, 'fetch user');
    }
}

/**
 * Updates an existing user
 */
export async function updateUser(
    prevState: ActionResponse | undefined,
    formData: FormData,
): Promise<ActionResponse> {

    const userId = formData.get('userId') as string;
    const fullName = formData.get('fullName') as string;
    const email = formData.get('email') as string;
    const role = formData.get('role') as string;

    // Enhanced validation
    if (!userId?.trim()) {
        return { success: false, message: "User ID is required." };
    }

    if (!fullName?.trim() || !email?.trim() || !role?.trim()) {
        return { success: false, message: "All fields are required." };
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { success: false, message: "Please enter a valid email address." };
    }

    const updateUserDto = {
        Name: fullName.trim(),
        Email: email.trim().toLowerCase(),
        RoleId: getRoleIdFromName(role),
    };

    try {
        const apiClient = await createAuthenticatedApiClient();

        console.log(`Attempting to update user ${userId} with payload:`, updateUserDto);

        const response = await apiClient.put(`/Users/${userId}`, updateUserDto);

        console.log('User update response:', response.data);

        // Revalidate the path on success
        revalidatePath('/dashboard/users');
        revalidatePath(`/dashboard/users/edit/${userId}`);

        return {
            success: true,
            message: "User updated successfully!",
            user: response.data
        };

    } catch (error: any) {
        console.error("Update User API Error:", error);
        return handleApiError(error, 'update user');
    }
}

/**
 * Deletes a user by ID
 */
export async function deleteUser(userId: string): Promise<ActionResponse> {
    if (!userId || userId.trim() === '') {
        return { success: false, message: "User ID is required." };
    }

    try {
        const apiClient = await createAuthenticatedApiClient();

        console.log(`Attempting to delete user with ID: ${userId}`);

        await apiClient.delete(`/Users/${userId}`);

        console.log('User deleted successfully');

        // Revalidate the path on success
        revalidatePath('/dashboard/users');

        return { success: true, message: "User deleted successfully!" };

    } catch (error: any) {
        console.error("Delete User API Error:", error);
        return handleApiError(error, 'delete user');
    }
}

/**
 * Centralized error handling for API calls
 */
function handleApiError(error: any, operation: string): ActionResponse {
    // Handle different types of errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        return { success: false, message: "Cannot connect to server. Please check if the API is running." };
    }

    if (error.message === 'Authentication required') {
        return { success: false, message: "Authentication required. Please log in again." };
    }

    if (error.response) {
        // The server responded with an error status
        const status = error.response.status;
        const errorData = error.response.data;

        console.error('API Error Response:', {
            status,
            data: errorData,
            headers: error.response.headers
        });

        switch (status) {
            case 400:
                return { success: false, message: errorData?.Message || "Invalid data provided." };
            case 401:
                return { success: false, message: "Authentication failed. Please log in again." };
            case 403:
                return { success: false, message: `You don't have permission to ${operation}.` };
            case 404:
                return { success: false, message: "User not found." };
            case 409:
                return { success: false, message: "A user with this email already exists." };
            case 500:
                return { success: false, message: errorData?.Message || "Server error occurred." };
            default:
                return { success: false, message: errorData?.Message || `Server error (${status}).` };
        }
    } else if (error.request) {
        // Network error
        return { success: false, message: "Network error. Please check your connection." };
    } else {
        // Something else went wrong
        return { success: false, message: error.message || "An unexpected error occurred." };
    }
}

export async function createRoom(
    prevState: ActionResponse | undefined,
    formData: FormData,
): Promise<ActionResponse> {

    const roomName = formData.get('roomName') as string;
    const location = formData.get('location') as string;
    const capacity = formData.get('capacity') as string;
    const features = formData.get('features') as string; // JSON string of selected features

    // Enhanced validation
    if (!roomName?.trim() || !location?.trim() || !capacity?.trim()) {
        return { success: false, message: "Room name, location, and capacity are required." };
    }

    const capacityNum = parseInt(capacity);
    if (isNaN(capacityNum) || capacityNum <= 0) {
        return { success: false, message: "Capacity must be a positive number." };
    }

    if (capacityNum > 100) {
        return { success: false, message: "Capacity cannot exceed 100 people." };
    }

    let parsedFeatures = [];
    if (features) {
        try {
            parsedFeatures = JSON.parse(features);
        } catch (error) {
            return { success: false, message: "Invalid features data." };
        }
    }

    const createRoomDto = {
        Name: roomName.trim(),
        Location: location.trim(),
        Capacity: capacityNum,
        Features: parsedFeatures // Adjust based on your API structure
    };

    try {
        const apiClient = await createAuthenticatedApiClient();

        console.log('Attempting to create room with payload:', createRoomDto);

        const response = await apiClient.post('/Rooms', createRoomDto);

        console.log('Room creation response:', response.data);

        // Revalidate the path on success
        revalidatePath('/dashboard/rooms');
        return { success: true, message: response.data.Message || "Room created successfully!" };

    } catch (error: any) {
        console.error("Create Room API Error:", error);
        return handleApiError(error, 'create room');
    }
}

/**
 * Fetches a room by ID
 */
export async function getRoomById(roomId: string): Promise<ActionResponse> {
    if (!roomId || roomId.trim() === '') {
        return { success: false, message: "Room ID is required." };
    }

    try {
        const apiClient = await createAuthenticatedApiClient();

        console.log(`Fetching room with ID: ${roomId}`);

        const response = await apiClient.get(`/Rooms/${roomId}`);

        console.log('Get room response:', response.data);

        return {
            success: true,
            message: response.data.Message || "Room fetched successfully!",
            room: response.data.room || response.data
        };

    } catch (error: any) {
        console.error("Get Room API Error:", error);
        return handleApiError(error, 'fetch room');
    }
}

/**
 * Updates an existing room
 */
export async function updateRoom(
    prevState: ActionResponse | undefined,
    formData: FormData,
): Promise<ActionResponse> {

    const roomId = formData.get('roomId') as string;
    const roomName = formData.get('roomName') as string;
    const location = formData.get('location') as string;
    const capacity = formData.get('capacity') as string;
    const features = formData.get('features') as string; // JSON string of selected features

    // Enhanced validation
    if (!roomId?.trim()) {
        return { success: false, message: "Room ID is required." };
    }

    if (!roomName?.trim() || !location?.trim() || !capacity?.trim()) {
        return { success: false, message: "Room name, location, and capacity are required." };
    }

    const capacityNum = parseInt(capacity);
    if (isNaN(capacityNum) || capacityNum <= 0) {
        return { success: false, message: "Capacity must be a positive number." };
    }

    if (capacityNum > 100) {
        return { success: false, message: "Capacity cannot exceed 100 people." };
    }

    let parsedFeatures = [];
    if (features) {
        try {
            parsedFeatures = JSON.parse(features);
        } catch (error) {
            return { success: false, message: "Invalid features data." };
        }
    }

    const updateRoomDto = {
        Name: roomName.trim(),
        Location: location.trim(),
        Capacity: capacityNum,
        Features: parsedFeatures // Adjust based on your API structure
    };

    try {
        const apiClient = await createAuthenticatedApiClient();

        console.log(`Attempting to update room ${roomId} with payload:`, updateRoomDto);

        const response = await apiClient.put(`/Rooms/${roomId}`, updateRoomDto);

        console.log('Room update response:', response.data);

        // Revalidate the path on success
        revalidatePath('/dashboard/rooms');
        revalidatePath(`/dashboard/rooms/edit/${roomId}`);

        return {
            success: true,
            message: "Room updated successfully!",
            room: response.data
        };

    } catch (error: any) {
        console.error("Update Room API Error:", error);
        return handleApiError(error, 'update room');
    }
}

/**
 * Deletes a room by ID
 */
export async function deleteRoom(roomId: string): Promise<ActionResponse> {
    if (!roomId || roomId.trim() === '') {
        return { success: false, message: "Room ID is required." };
    }

    try {
        const apiClient = await createAuthenticatedApiClient();

        console.log(`Attempting to delete room with ID: ${roomId}`);

        await apiClient.delete(`/Rooms/${roomId}`);

        console.log('Room deleted successfully');

        // Revalidate the path on success
        revalidatePath('/dashboard/rooms');

        return { success: true, message: "Room deleted successfully!" };

    } catch (error: any) {
        console.error("Delete Room API Error:", error);
        return handleApiError(error, 'delete room');
    }
}


export async function createMeeting(
    prevState: ActionResponse | undefined,
    formData: FormData
): Promise<ActionResponse> {
    try {
        const attendeeIds = formData.getAll('attendeeIds').map(id => Number(id));

        // This assumes your backend's CreateMeetingDto expects these properties.
        const meetingDto = {
            Title: formData.get('title'),
            Agenda: formData.get('agenda'),
            StartTime: formData.get('startTime'),
            EndTime: formData.get('endTime'),
            RoomId: Number(formData.get('roomId')),
            AttendeeIds: attendeeIds
        };

        // Use the authenticated API client instead of the generic api import
        const apiClient = await createAuthenticatedApiClient();
        const response = await apiClient.post('/Meetings', meetingDto);

        console.log('Meeting creation response:', response.data);

        revalidatePath('/dashboard/meetings');
        revalidatePath('/dashboard/calendar');
        return {
            success: true,
            message: response.data.Message || "Meeting scheduled successfully!"
        };

    } catch (error: any) {
        console.error("Create Meeting API Error:", error);
        return handleApiError(error, 'create meeting');
    }
}

export async function deleteMeeting(meetingId: string): Promise<ActionResponse> {
    if (!meetingId || meetingId.trim() === '') {
        return { success: false, message: "Meeting ID is required." };
    }

    try {
        const apiClient = await createAuthenticatedApiClient();

        console.log(`Attempting to delete meeting with ID: ${meetingId}`);

        // The API endpoint is /Meetings/{id}
        await apiClient.delete(`/Meetings/${meetingId}`);

        console.log('Meeting deleted successfully');

        // Revalidate paths to refresh data on the meetings and calendar pages
        revalidatePath('/dashboard/meetings');
        revalidatePath('/dashboard/calendar');

        return { success: true, message: "Meeting deleted successfully!" };

    } catch (error: any) {
        console.error("Delete Meeting API Error:", error);
        return handleApiError(error, 'delete meeting');
    }
}


/**
 * NEW: Fetches the necessary data for the create/edit meeting form (rooms and users).
 */
export async function getMeetingFormData(): Promise<ActionResponse> {
    try {
        const apiClient = await createAuthenticatedApiClient();
        const response = await apiClient.get('/Meetings/Form-Data');
        return { success: true, message: 'Form data fetched.', data: response.data };
    } catch (error: any) {
        // This is not a user-facing form action, so we re-throw to be caught by the component
        console.error("Get Meeting Form Data API Error:", error);
        throw new Error('Failed to fetch form data from server.');
    }
}

/**
 * NEW: Fetches a single meeting's details specifically for the edit form.
 */
export async function getMeetingForEdit(meetingId: string): Promise<ActionResponse> {
    if (!meetingId) return { success: false, message: 'Meeting ID is required.' };
    try {
        const apiClient = await createAuthenticatedApiClient();
        const response = await apiClient.get(`/Meetings/Details/${meetingId}`);
        return { success: true, message: 'Meeting details fetched.', meeting: response.data };
    } catch (error: any) {
        // This is not a user-facing form action, so we re-throw to be caught by the component
        console.error("Get Meeting for Edit API Error:", error);
        throw new Error('Failed to fetch meeting details from server.');
    }
}

/**
 * NEW: Updates an existing meeting.
 */
export async function updateMeeting(
    prevState: ActionResponse | undefined,
    formData: FormData,
): Promise<ActionResponse> {

    const meetingId = formData.get('meetingId') as string;

    if (!meetingId) return { success: false, message: 'Meeting ID is missing.' };
    if (!formData.get('title') || !formData.get('startTime') || !formData.get('endTime') || !formData.get('roomId')) {
        return { success: false, message: "Please fill out all required fields." };
    }

    const updateMeetingDto = {
        Title: formData.get('title'),
        Agenda: formData.get('agenda'),
        StartTime: new Date(formData.get('startTime') as string).toISOString(),
        EndTime: new Date(formData.get('endTime') as string).toISOString(),
        RoomId: Number(formData.get('roomId')),
        AttendeeIds: formData.getAll('attendeeIds').map(id => Number(id)),
        Status: 'Scheduled'
    };

    try {
        const apiClient = await createAuthenticatedApiClient();
        await apiClient.put(`/Meetings/${meetingId}`, updateMeetingDto);

        revalidatePath('/dashboard/meetings');
        revalidatePath('/dashboard/calendar');
        revalidatePath(`/dashboard/meetings/edit/${meetingId}`);

        return { success: true, message: "Meeting updated successfully!" };
    } catch (error: any) {
        return handleApiError(error, 'update meeting');
    }
}

export async function updateProfile(
    prevState: ActionResponse | undefined,
    formData: FormData,
): Promise<ActionResponse> {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, message: "You must be logged in to update your profile." };
    }

    const name = formData.get('name') as string;
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    // Basic validation
    if (!name?.trim()) {
        return { success: false, message: "Your name cannot be empty." };
    }

    // Password validation - only validate if password is being changed
    if (newPassword) {
        if (newPassword.length < 6) {
            return { success: false, message: "New password must be at least 6 characters long." };
        }

        // Check if passwords match when changing password
        if (newPassword !== confirmPassword) {
            return { success: false, message: "Passwords do not match." };
        }
    }

    // Build the DTO, only including the password if it's being changed
    const updateProfileDto: { Name: string; Password?: string } = {
        Name: name.trim(),
    };

    if (newPassword && newPassword.trim()) {
        updateProfileDto.Password = newPassword;
    }

    try {
        const apiClient = await createAuthenticatedApiClient();
        const response = await apiClient.put('/Users/Profile', updateProfileDto);

        revalidatePath('/dashboard/profile');

        return {
            success: true,
            message: response.data.message || "Profile updated successfully!",
            newName: updateProfileDto.Name
        };
    } catch (error: any) {
        return handleApiError(error, 'update your profile');
    }
}

export async function globalSearch(term: string): Promise<ActionResponse & { data?: GlobalSearchResults }> {
    if (!term || term.trim().length < 2) {
        return { success: true, message: "Search term is too short.", data: { meetings: [], rooms: [], users: [] } };
    }
    try {
        const apiClient = await createAuthenticatedApiClient();
        const response = await apiClient.get('/api/Search', { params: { term } });
        return { success: true, message: "Search successful.", data: response.data };
    } catch (error: any) {
        // For search, we don't want to throw a fatal error, just return no results.
        console.error("Global Search API Error:", error);
        return { success: false, message: "Search failed.", data: { meetings: [], rooms: [], users: [] } };
    }
}

export async function saveMinutes(prevState: any, formData: FormData) {
    const apiClient = await createAuthenticatedApiClient();

    const momId = formData.get('momId') as string;
    const meetingId = formData.get('meetingId') as string;
    const momDataString = formData.get('momData') as string;

    if (!meetingId || !momDataString) {
        return { success: false, message: 'Missing required form data.' };
    }

    try {
        const momData = JSON.parse(momDataString);
        let response;

        if (momId) {
            // Update existing minutes
            response = await apiClient.put(`/Moms/${momId}`, momData);
        } else {
            // Create new minutes
            response = await apiClient.post('/Moms', momData);
        }

        // Check if response is successful (status 200-299)
        if (response.status >= 200 && response.status < 300) {
            // Success - revalidate and redirect
            revalidatePath('/dashboard/meetings');
            redirect('/dashboard/meetings');
        } else {
            const errorData = response.data;
            return { success: false, message: errorData?.message || 'Failed to save minutes.' };
        }

    } catch (error: any) {
        console.error("Save Minutes Error:", error);
        if (error.response) {
            return {
                success: false,
                message: error.response.data?.Message || 'Failed to save minutes.'
            };
        }
        return { success: false, message: 'An unexpected error occurred.' };
    }
}

export async function requestAccount(
    prevState: ActionResponse | undefined,
    formData: FormData,
): Promise<ActionResponse> {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;

    if (!name?.trim() || !email?.trim()) {
        return { success: false, message: "Name and email are required." };
    }

    // In a real application, you would send this to your backend
    // e.g., await api.post('/Users/RequestAccount', { name, email });
    console.log(`Account request submitted for ${name} (${email})`);

    // Simulate a successful request
    return {
        success: true,
        message: "Thank you! Your request has been submitted for approval."
    };
}

export async function requestPasswordReset(
    prevState: ActionResponse | undefined,
    formData: FormData,
): Promise<ActionResponse> {
    const email = formData.get('email') as string;

    if (!email?.trim()) {
        return { success: false, message: "Email is required." };
    }

    // In a real application, this would call your backend to send an email
    // e.g., await api.post('/Users/ForgotPassword', { email });
    console.log(`Password reset requested for ${email}`);

    // Always return a generic success message for security
    return {
        success: true,
        message: "If an account with that email exists, a password reset link has been sent."
    };
}

export async function resetPassword(
    prevState: ActionResponse | undefined,
    formData: FormData,
): Promise<ActionResponse> {
    const token = formData.get('token') as string;
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (!token) {
        return { success: false, message: "Reset token is missing." };
    }
    if (!newPassword || newPassword.length < 6) {
        return { success: false, message: "Password must be at least 6 characters." };
    }
    if (newPassword !== confirmPassword) {
        return { success: false, message: "Passwords do not match." };
    }

    // In a real application, this would call your backend with the token and new password
    // e.g., await api.post('/Users/ResetPassword', { token, newPassword });
    console.log(`Password has been reset with token: ${token}`);

    return { success: true, message: "Your password has been reset successfully!" };
}
