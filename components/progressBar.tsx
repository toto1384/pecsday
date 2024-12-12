
export function ProgressBar(
    { percent, color = 'var(--primary)' }: { percent: number, color?: string }) {
    return <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div className={`h-2.5 transition-all rounded-full`} style={{ width: `${percent}%`, backgroundColor: color }}></div>
    </div>
}

export function StepsProgressBar({ step, allSteps, className }: { step: number, allSteps: number, className?: string }) {
    const percent = (step - 1) * 100 / allSteps
    return <div className={className}>
        <p>{step > allSteps ? 'Done' : `Step ${step} of ${allSteps}`}</p>
        <ProgressBar percent={percent == 0 ? percent + 10 : percent} />
    </div>
}