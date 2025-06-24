import { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import { ethers } from 'ethers';

// Components
import Navigation from './Navigation';
import Info from './Info';

function App() {

    const [account, setAccount] = useState(null)

    // account -> var of current account Value
    // setAccount('0x0...') -> Function to update account value
    // null in default value

    const loadBockchainData = async () => {
        const provider = new ethers.providers.Web3Provider(window.ethereum)

        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        const account = ethers.utils.getAddress(accounts[0])
        console.log(account)
        setAccount(account)

    }

    useEffect(() => {
        loadBockchainData()
    })

    return(
        <Container>
            <Navigation />
            <hr />
            {account && (
            <Info account={account} />
            )}
        </Container>
    )
}

export default App;