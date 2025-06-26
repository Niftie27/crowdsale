import { useState } from 'react';
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Spinner from 'react-bootstrap/Spinner'
import { ethers } from 'ethers';

const Buy = ({ provider, price, crowdsale, setIsLoading,  }) => {
    const [amount, setAmount] = useState('0')
    const [isWaiting, setIsWaiting] = useState(false)

    // ✅ Added for whitelist form
    const [whitelistAmount, setWhitelistAmount] = useState('0'); // ✅
    const [isWhitelistWaiting, setIsWhitelistWaiting] = useState(false); // ✅

    const buyHandler = async (e) => {
        e.preventDefault();
        setIsWaiting(true);

        try {
            const signer = await provider.getSigner();
            const value = ethers.utils.parseUnits((amount * price).toString(), 'ether');
            const formattedAmount = ethers.utils.parseUnits(amount.toString(), 'ether');

            const transaction = await crowdsale.connect(signer).buyTokens(formattedAmount, { value });
            await transaction.wait();
            setIsLoading(true);
        } catch (error) {
            // ✅ Inline error message handling
            const errorMessage = error?.error?.data?.message || error?.data?.message || error?.message;

            if (errorMessage?.includes("user not whitelisted")) {
                window.alert("You are not whitelisted");
            } else if (errorMessage?.includes("Token sale not started yet")) {
                window.alert("Sale hasn't started yet");
            } else if (errorMessage) {
                window.alert(errorMessage);
            } else {
                window.alert("Transaction failed or was rejected");
            }
        }

        setIsWaiting(false); // ✅
    };

    // ✅ New whitelist-specific buy handler with detailed error
    const buyWhitelistHandler = async (e) => {
        e.preventDefault();
        setIsWhitelistWaiting(true);

        try {
            const signer = await provider.getSigner();
            const value = ethers.utils.parseUnits((whitelistAmount * price).toString(), 'ether');
            const formattedAmount = ethers.utils.parseUnits(whitelistAmount.toString(), 'ether');

            const transaction = await crowdsale.connect(signer).buyWhitelist(formattedAmount, { value });
            await transaction.wait();
            setIsLoading(true);
        } catch (error) {
            // ✅ Inline error message handling
            const errorMessage = error?.error?.data?.message || error?.data?.message || error?.message;

            if (errorMessage?.includes("user not whitelisted")) {
                window.alert("You are not whitelisted");
            } else if (errorMessage?.includes("Token sale not started yet")) {
                window.alert("Sale hasn't started yet");
            } else if (errorMessage) {
                window.alert(errorMessage);
            } else {
                window.alert("Transaction failed or was rejected");
            }
        }

        setIsWhitelistWaiting(false); // ✅
    };

    const whitelistMe = async () => {
        try {
            const signer = provider.getSigner();
            const account = await signer.getAddress();
            const tx = await crowdsale.connect(signer).addToWhitelist(account);
            await tx.wait();
            alert("Whitelisted successfully!");
        } catch (error) {
            const errorMessage = error?.error?.data?.message || error?.data?.message || error?.message;

            if (errorMessage) {
                window.alert(errorMessage);
            } else {
                window.alert("Failed to whitelist. Are you the owner?");
            }
        }
    };
    


    return(
        
        <div style={{ maxWidth: '800px', margin: '50px auto' }}>
            {/* ✅ Original Buy Form */}
            <Form onSubmit={buyHandler} style={{ maxWidth: '800px', margin: '50px auto' }}>
                <Form.Group as={Row}>
                    <Col>
                        <Form.Control type="number" placeholder="Enter amount" onChange={(e) => setAmount(e.target.value)}/>
                    </Col>
                    <Col className='text-center'>
                        {isWaiting ? (
                            <Spinner animation="border"/>
                        ) : (
                        <Button variant="primary" type="submit" style= {{ width: '100%' }}>
                            Buy tokens
                        </Button>
                    )}
                    </Col>
                </Form.Group>
            </Form>
        {/* ✅ Whitelist Buy Form */}
            <Form onSubmit={buyWhitelistHandler}>
                <Form.Group as={Row}>
                    <Col>
                        <Form.Control
                            type="number"
                            placeholder="Enter whitelist amount"
                            onChange={(e) => setWhitelistAmount(e.target.value)} // ✅
                        />
                    </Col>
                    <Col className='text-center'>
                        {isWhitelistWaiting ? (
                            <Spinner animation="border" />
                        ) : (
                            <Button variant="success" type="submit" style={{ width: '100%' }}>
                                Buy (Whitelist)
                            </Button>
                        )}
                    </Col>
                </Form.Group>
            </Form>

            {/* Whitelist Self (Test Only) */}
            <div className="text-center mt-3">
                <Button onClick={whitelistMe} variant="warning">
                    Whitelist My Address (Test)
                </Button>
            </div>
        </div>
    );
};
export default Buy;