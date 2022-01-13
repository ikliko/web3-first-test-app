import React, {Component} from "react";

import logo from './logo.svg';
import './App.css';
import {Moralis} from "moralis";

// function App() {
//     const { authenticate, isAuthenticated, user } = useMoralis();
//
//     if (!isAuthenticated) {
//         return (
//             <div>
//                 <button onClick={() => authenticate()}>Authenticate</button>
//             </div>
//         );
//     }
//
//     Moralis.Web3.getAllERC20()
//         .then(data => {
//             console.log(data);
//         });
//
//     return (
//         <div>
//             <h1>Welcome {user.get("username")}</h1>
//         </div>
//     );
// }

const defaultState = {
    isMetamaskInstalled: false,
    isMetamaskConnected: false,
    isLoading: true,
    isMainnet: false,
    chains: null,
    chain: null,
    account: null,
    amount: 0,
    moralisUser: null,
    tokensInfo: null
};

class App extends Component {

    constructor(props) {
        super(props);

        this.state = defaultState;
    }

    componentWillMount() {
        fetch('https://chainid.network/chains.json')
            .then(res => res.json())
            .then(res => {
                this.setState({
                    ...this.state,
                    chains: res
                });

                setTimeout(() => {

                    // detectEthereumProvider()
                    //     .then(data => {
                    //         console.log(data);
                    //     });

                    // ethereum
                    //     .request({method: 'eth_accounts'})
                    //     .then(data => {
                    //
                    //
                            this.initWalletConnect();
                    //     })
                    //     .catch((err) => {
                    //         // Some unexpected error.
                    //         // For backwards compatibility reasons, if no accounts are available,
                    //         // eth_accounts will return an empty array.
                    //         console.warn(err);
                    //     });
                })
            });

        const {ethereum} = window;

        if (!ethereum) {
            this.setState({
                ...this.state,
                isLoading: false
            });

            return;
        }

        ethereum.on('accountsChanged', accounts => {
            if (!accounts.length) {
                Moralis.User.logOut()
                    .then(data => {
                        this.setState(defaultState);
                        this.initWalletConnect();
                    });


                return;
            }

        });

        // detect Network account change
        window.ethereum.on('chainChanged', () => {
            this.initWalletConnect();
        });

        ethereum.on('disconnect', () => {
            console.log(123);
            Moralis.User.logOut()
                .then(data => {
                    this.setState(defaultState);
                })
        });
    }

    connectWallet = () => {
        window.ethereum.request({method: 'eth_requestAccounts'})
            .catch(e => console.log(e))
            .then(data => {
                this.setState({
                    ...this.state,
                    isMetamaskConnected: !!data.length
                });

                this.initWalletConnect();
            });
    };

    render() {
        const {
            chain,
            isMetamaskInstalled,
            isMetamaskConnected,
            isLoading,
            isMainnet,
            account,
            amount,
            tokensInfo
        } = this.state;

        if (!chain && isLoading) {
            return (
                <div className="App">
                    <header className="App-header">
                        <img src={logo} className="App-logo" alt="logo"/>
                        Loading...
                    </header>
                </div>
            )
        }

        console.log(tokensInfo);

        return (
            <div className="App">
                <header className="App-header">
                    <img src={logo} className="App-logo" alt="logo"/>
                    {
                        !isMetamaskInstalled && (
                            <div>
                                <p>
                                    No metamask detected. <a
                                    className="App-link"
                                    href="https://metamask.io/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Download Metamask
                                </a>.
                                </p>

                            </div>
                        )
                    }
                    {
                        isMetamaskInstalled && !isMetamaskConnected && (
                            <div>
                                <button onClick={this.connectWallet}>Connect wallet</button>
                            </div>
                        )
                    }
                    {
                        isMetamaskInstalled && isMetamaskConnected && (
                            <div>
                                <p>
                                    Address connected: <br/> {account}
                                </p>
                                <div>
                                    <p>
                                        Network: {chain.name}
                                        {
                                            !isMainnet && (
                                                <a onClick={this.switchToEthereumMainnet}>
                                                    <strong> &lt;-SWITCH TO MAINNET</strong>
                                                </a>
                                            )
                                        }
                                    </p>

                                    <p>
                                        Amount: {amount} {chain.nativeCurrency.symbol}
                                    </p>
                                </div>
                            </div>
                        )
                    }
                    <hr/>
                    {
                        tokensInfo && (
                            <div>
                                <h2>Tokens Info</h2>
                                <hr/>

                                {
                                    tokensInfo.map((token, i) => (
                                        <div key={i}>
                                            <p>
                                                {token.name} ({token.symbol})
                                            </p>

                                            <p>
                                                Decimals: {token.decimals}
                                            </p>

                                            <p>
                                                Balance: {token.readableBalance}
                                            </p>

                                            <hr/>
                                        </div>
                                    ))
                                }
                            </div>
                        )
                    }
                </header>
            </div>
        );
    }

    initWalletConnect() {
        const {ethereum} = window;
        const {chains} = this.state;

        if (typeof ethereum !== 'undefined') {
            ethereum.request({method: 'eth_chainId'})
                .then(data => {
                    const chainId = parseInt(data, 16);

                    let chain = chains.find(c => c.chainId === chainId);

                    if (!chain) {
                        return;
                    }

                    this.setState({
                        ...this.state,
                        isMainnet: chain.name.toLowerCase().includes('mainnet'),
                        chain,
                        isLoading: false
                    })
                });


            this.setState({
                ...this.state,
                isMetamaskInstalled: true,
            });

            ethereum.request({method: 'eth_accounts'})
                .catch(e => console.log(e))
                .then(data => {
                    const account = data[0];

                    this.setState({
                        ...this.state,
                        isMetamaskConnected: !!account,
                        account
                    });

                    setTimeout(() => {
                        if(!account) {
                            return;
                        }

                        this.loadMoralisData();
                        this.getBalance();
                    })
                });
        }
    }

    getBalance() {
        const {ethereum} = window;


        ethereum.request({
            method: 'eth_getBalance',
            params: [
                this.state.account,
                'latest'
            ]

        })
            .catch(e => console.log(e))
            .then(data => {
                this.setState({
                    ...this.state,
                    amount: this.parseBalance(data)
                })
            })
    }

    parseBalance(amount, decimals = 18) {
        return amount / Math.pow(10, decimals);
    }

    switchToEthereumMainnet() {
        const {ethereum} = window;

        ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [
                {
                    chainId: `0x${(1).toString(16)}`
                }
            ]
        })
            .catch(e => console.log(e))
            .then(success => {
                if (success) {
                    this.initWalletConnect();
                }
            })
    }

    getTokensBalances() {
        Moralis.Web3.getAllERC20()
            .then(data => {
                this.setState({
                    ...this.state,
                    tokensInfo: this.parseTokensBalance(data)
                })
            });
    }

    loadMoralisData() {
        const user = Moralis.User.current();

        if (!user) {
            Moralis.Web3.authenticate()
                .catch(e => console.warn)
                .then(account => {
                    this.setState({
                        ...this.state,
                        moralisUser: account
                    });

                    setTimeout(() => {
                        this.getTokensBalances();
                    })
                });

            return;
        }

        this.getTokensBalances();
    }

    parseTokensBalance(tokens) {
        return tokens.map(token => ({
            ...token,
            readableBalance: this.parseBalance(token.balance, token.decimals)
        }));
    }
}

export default App;
