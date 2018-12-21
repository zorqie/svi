import { version, Component } from 'inferno';
import './App.css';
import Grid from './ui/pixel-grid'

const sixteen = [...Array(16).keys()]
const two56 = sixteen.map(i => sixteen.map(j => 'something ' + (i*16 + j)))


class App extends Component {
  state = { active: {}}
  handleExec = (i, j, e) => {
    console.log("Execute ", two56[i][j], e)
    if(e && e.shiftKey) {
      this.setState({active: {...this.state.active, [i*16+j]: '1'}})
    } else {
      this.setState({active: {[i*16+j]: '1'}})
    }
  }
  renderC = (i, j) => {
    const {active} = this.state
    return active[i*16+j] ? <b>{two56[i][j]}</b> : (''+two56[i][j])
  }
  render() {
    const { active } = this.state
    return (
      <div className="App" >
        <header className="App-header">
          <p>Ze App</p>
        </header>
        <Grid renderItem={this.renderC} active={active} exec={this.handleExec}/>
        <footer>{`On Inferno ${version}`}</footer>
      </div>
    );
  }
}

export default App;
