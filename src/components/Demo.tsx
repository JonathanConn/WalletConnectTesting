import { ChatModal } from '@/components/ChatModal'
import { Web3Button } from '@web3modal/react'

export default function Demo() {

    return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content flex-col lg:flex-row-reverse">

        <div className="card w-96 glass p-5">
          
          <ChatModal />             

          <div className="card-body items-center text-center">
            <h1 className="card-title">Messenger</h1>
            <span>Connect your wallet to try out Messenger</span>
          </div>
          <div className="card-actions justify-center pb-2">
              <Web3Button />
          </div>
        </div>

      </div>
    </div>
  )
}