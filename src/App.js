import React, {Component} from "react";

import logo from './logo.svg';
import './App.css';


class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isMetamaskInstalled: false,
            isMetamaskConnected: false,
            chains: null,
            chain: null,
            account: null
        };
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
                    this.initWalletConnect();
                })
            });


        window.ethereum.on('accountsChanged', (accounts) => {
            this.setState({
                ...this.state,
                account: accounts[0]
            });
        });

        // detect Network account change
        window.ethereum.on('chainChanged', (networkId) => {
            console.log('networkChanged', networkId);
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
            chains,
            chain,
            isMetamaskInstalled,
            isMetamaskConnected,
            account
        } = this.state;

        console.log(chain);


        return (
            <div className="App">
                <header className="App-header">
                    <img src={logo} className="App-logo" alt="logo"/>
                    {
                        !isMetamaskInstalled && (
                            <div>
                                <p>
                                    No metamask installed. Please install metamask.
                                </p>
                                <a
                                    className="App-link"
                                    href="https://metamask.io/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Install metamask
                                </a>
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
                                    </p>
                                </div>
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
                    this.setState({
                        ...this.state,
                        chain
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
                // '0x407d73d8a49eeb85d32cf465507dd71d507100c1',
                'latest'
            ]

        })
            .catch(e => console.log(e))
            .then(data => {
                console.log(data);
            })
    }
}

// function App() {
//     const [account, setAccount] = useState(null);
//     const [isMetamaskInstalled, setIsMetamaskInstalled] = useState(false);
//     const [isMetamaskConnected, setIsMetamaskConnected] = useState(false);
//     const [chain, setChain] = useState(null);
//     const [chains, setChains] = useState(null);
//     fetch('https://chainid.network/chains.json')
//         .then(res => res.json())
//         .then(res => {
//             setChains(res);
//         });
//
//     // useEffect(() => {
//     //     if(chain) {
//     //         return;
//     //     }
//     //
//     //     window.ethereum.on('accountsChanged', (accounts) => {
//     //         setAccount(accounts[0]);
//     //     });
//     //
//     //     // detect Network account change
//     //     window.ethereum.on('chainChanged', (networkId) => {
//     //         console.log('networkChanged', networkId);
//     //     });
//     //
//     //     return () => {
//     //     }
//     // }, []);
//     //
//     // useEffect((chains) => {
//     //     if(!chains) {
//     //         return;
//     //     }
//     //
//     //     if (typeof window.ethereum !== 'undefined') {
//     //         setIsMetamaskInstalled(true);
//     //
//     //         let chain = chains.find(c => c.chainId === +window.ethereum.networkVersion);
//     //
//     //         if (!chain) {
//     //             // todo
//     //         }
//     //         setChain(chain);
//     //         window.ethereum.request({method: 'eth_accounts'})
//     //             .catch(e => console.log(e))
//     //             .then(data => {
//     //                 setIsMetamaskConnected(!!data.length);
//     //                 setAccount(data[0]);
//     //             });
//     //     }
//     // }, [chains]);
//     //
//     // let connectWallet = () => {
//     //     window.ethereum.request({method: 'eth_requestAccounts'})
//     //         .catch(e => console.log(e))
//     //         .then(data => {
//     //             console.log(data);
//     //             setIsMetamaskConnected(!!data.length)
//     //         });
//     // };
//
//
//     return (
//         <div className="App">
//             <header className="App-header">
//                 {!chains && 'no'}
//                 <img src={logo} className="App-logo" alt="logo"/>
//                 {
//                     !isMetamaskInstalled && (
//                         <div>
//                             <p>
//                                 No metamask installed. Please install metamask.
//                             </p>
//                             <a
//                                 className="App-link"
//                                 href="https://metamask.io/"
//                                 target="_blank"
//                                 rel="noopener noreferrer"
//                             >
//                                 Install metamask
//                             </a>
//                         </div>
//                     )
//                 }
//                 {
//                     isMetamaskInstalled && !isMetamaskConnected && (
//                         <div>
//                             <button onClick={connectWallet}>Connect wallet</button>
//                         </div>
//                     )
//                 }
//                 {
//                     isMetamaskInstalled && isMetamaskConnected && (
//                         <div>
//                             <p>
//                                 Address connected: {account}
//                             </p>
//                             <p>
//
//                             </p>
//                         </div>
//                     )
//                 }
//             </header>
//         </div>
//     );
// }

export default App;
