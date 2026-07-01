"use client"
export default function LoadingSpinner({ text = "占卜中…" }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 rounded-full border-[1.5px]" style={{ borderColor: 'rgba(201,149,74,0.1)' }} />
        <div className="absolute inset-0 rounded-full border-[1.5px] border-t-[#C9954A] animate-spin" style={{ borderRightColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: 'transparent' }} />
        <div className="absolute inset-0 flex items-center justify-center"><div className="w-1.5 h-1.5 rounded-full bg-[#C9954A] animate-pulse" /></div>
      </div>
      <div className="text-xs mt-4 tracking-wider animate-pulse" style={{ color: 'rgba(237,228,212,0.4)' }}>{text}</div>
    </div>
  )
}
