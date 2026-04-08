'use client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { EnvironmentalInfo as EnvInfoType } from "@/lib/types";
import { Footprints, Bike, ShieldCheck, CloudRain, Waves } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

interface EnvironmentalInfoProps {
    info: EnvInfoType;
}

const scoreInfo = {
    walkScore: { label: 'Walk Score', icon: Footprints, description: 'How walkable is this area?' },
    bikeScore: { label: 'Bike Score', icon: Bike, description: 'How bikeable is this area?' },
    roadSafety: { label: 'Road Safety', icon: ShieldCheck, description: 'Safety rating for nearby roads.' },
    floodRisk: { label: 'Flood Risk', icon: CloudRain, description: 'Risk of flooding in this area.' },
    noiseLevel: { label: 'Noise Level', icon: Waves, description: 'Estimated noise pollution.' },
}

const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
}

const getRiskColor = (score: number) => {
    if (score <= 20) return 'bg-green-500';
    if (score <= 40) return 'bg-yellow-500';
    if (score <= 60) return 'bg-orange-500';
    return 'bg-red-500';
}

export function EnvironmentalInfo({ info }: EnvironmentalInfoProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Area Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <TooltipProvider>
                    {Object.entries(info).map(([key, value]) => {
                        const meta = scoreInfo[key as keyof typeof scoreInfo];
                        const isRisk = key === 'floodRisk' || key === 'noiseLevel';
                        const colorClass = isRisk ? getRiskColor(value) : getScoreColor(value);

                        return (
                             <Tooltip key={key}>
                                <TooltipTrigger className="w-full text-left">
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between text-sm font-medium">
                                            <div className="flex items-center gap-2">
                                                <meta.icon className="h-4 w-4 text-muted-foreground" />
                                                <span>{meta.label}</span>
                                            </div>
                                            <span>{value} / 100</span>
                                        </div>
                                        <Progress value={value} indicatorClassName={colorClass} />
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{meta.description}</p>
                                </TooltipContent>
                            </Tooltip>
                        )
                    })}
                </TooltipProvider>
            </CardContent>
        </Card>
    )
}
