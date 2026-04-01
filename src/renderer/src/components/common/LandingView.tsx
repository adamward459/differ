import { memo } from 'react'
import { RiFolderOpenLine } from '@remixicon/react'
import logoSrc from '../../assets/Logo.png'

const LandingView = memo(function LandingView({ onOpenFolder }: { onOpenFolder: () => void }) {
  return (
    <div className="flex h-screen items-center justify-center bg-surface text-text">
      <div className="flex flex-col items-center gap-5">
        <img src={logoSrc} alt="Differ logo" className="w-20 h-20 rounded-2xl" />
        <div className="text-center">
          <p className="text-[15px] font-semibold text-text mb-1">Open a repository</p>
          <p className="text-[13px] text-text-muted">Select a folder to view its changes</p>
        </div>
        <button
          onClick={onOpenFolder}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white text-[13px] font-medium hover:opacity-90 transition-opacity shadow-sm"
        >
          Open Folder
        </button>
      </div>
    </div>
  )
})

export default LandingView
