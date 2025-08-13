import { MapPin } from 'lucide-react'
import Badge from './Badge'
import Button from './DefaultButton'
import Card from "@/components/ui/Card";

interface RoomCardProps {
    name: string
    capacity: number
    features: string[]
    available: boolean
    onBook?: () => void
}

export default function RoomCard({ name, capacity, features, available, onBook }: RoomCardProps) {
    return (
        <Card className="overflow-hidden" hover>
            <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center relative overflow-hidden">
                <MapPin className="w-12 h-12 text-blue-600 transition-transform duration-300 hover:scale-110" />
                <div className="absolute top-4 right-4">
                    <div className={`w-3 h-3 rounded-full ${available ? 'bg-green-500' : 'bg-red-500'} shadow-lg`}>
                        <div className={`w-3 h-3 rounded-full ${available ? 'bg-green-500' : 'bg-red-500'} animate-ping absolute`}></div>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-800">{name}</h3>
                    <Badge variant={available ? 'success' : 'error'}>
                        {available ? 'Available' : 'Occupied'}
                    </Badge>
                </div>

                <p className="text-sm text-slate-600">Capacity: {capacity} people</p>

                <div className="flex flex-wrap gap-1">
                    {features.slice(0, 2).map((feature, i) => (
                        <Badge key={i} variant="default">{feature}</Badge>
                    ))}
                    {features.length > 2 && (
                        <Badge variant="info">+{features.length - 2}</Badge>
                    )}
                </div>

                <Button
                    variant={available ? 'primary' : 'secondary'}
                    fullWidth
                    disabled={!available}
                    glow={available}
                    onClick={onBook}
                >
                    {available ? 'Book Now' : 'Occupied'}
                </Button>
            </div>
        </Card>
    )
}