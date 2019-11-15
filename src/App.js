import React, { Component } from 'react';
import './App.css';
import * as feed from './feedService'

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      instruments: [
        { symbol: 'BTCUSD', bid: null, ask: null },
        { symbol: 'BTCEUR', bid: null, ask: null },
        { symbol: 'ETHUSD', bid: null, ask: null },
        { symbol: 'ETHEUR', bid: null, ask: null }
      ]
    }
    
    this.handleConnectionOpen = this.handleConnectionOpen.bind(this)
    this.handleFeedQuote = this.handleFeedQuote.bind(this)
  }
  
  componentDidMount() {
    feed.connect(this.handleConnectionOpen, this.handleFeedQuote)
  }

  handleConnectionOpen() {
    this.state.instruments.forEach(item => {
      feed.subscribe(new feed.SubscriptionKey(
        item.symbol, 2, "BFWS", "BFWS", "FOREXLEVEL1"
      ))
    })
  }
  
  handleFeedQuote(quote) {
    this.setState(prevState => {
      let newInstruments = prevState.instruments.map(item => {
        if(item.symbol === quote.symbol) {
          const newItem = Object.assign({}, {
            symbol: item.symbol,
            bid: Math.round(quote.bidPrice * 10000000) / 10000000,
            ask: Math.round(quote.askPrice * 10000000) / 10000000
          })
          return newItem
        }
        return item
      })
      return { instruments: newInstruments }
    })
  }

  render() {
    return (
      <div className="App">
        <h1>Quote Feed</h1>
        <table>
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Bid</th>
              <th>Ask</th>
            </tr>
          </thead>
          <tbody>
            { this.state.instruments.map(item => (
              <tr key={item.symbol}>
                <td>{item.symbol}</td>
                <td>{item.bid}</td>
                <td>{item.ask}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

export default App;
