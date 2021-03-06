import { Component } from 'inferno';

const COLS = 16
const ROWS = 16

const rows = [...Array(ROWS).keys()]
const cols = [...Array(COLS).keys()]

class PixelGrid extends Component {
  state = {
    focus: {r: 0, c: 0}
  }
  focused = (x, y) => {
    const {r, c} = this.state.focus
    return r===x && c===y ? {className: 'focus'} : null
  }
  
  handleKey = e => {
    e.preventDefault()
    const { key, shiftKey } = e
    const { exec } = this.props
    const {r, c} = this.state.focus
    var u = {r, c}
    switch(key) {
      case 'ArrowLeft':
        if(c > 0) {
          u.c = c-1
        } else if(r > 0) {
          u.c = COLS
          u.r = r-1
        }
        break
      case 'ArrowRight':
        if(c < COLS) {
          u.c = c+1
        } else if(r < ROWS) {
          u.c = 0
          u.r = r+1
        }
        break
      case 'ArrowUp':
        if(r > 0) {
          u.r = r-1
        }
        break
      case 'ArrowDown':
        if(r < ROWS) {
          u.r = r+1
        }
        break
      case 'Enter': // consider code: "NumpadEnter" same?
        if(exec) exec(u.r, u.c, e)
        break
      default:
    }
    if(r !== u.r || c !== u.c) {
      this.setState({focus: u})
      if(shiftKey && exec) {
        exec(u.r, u.c, e)
      }
    }
    // console.log("Key", e)
  }
  handleClick = e => {
    e.preventDefault()
    const { target } = e
    if(target.tagName === 'TD') {
      const c = target.cellIndex - 1 //for the TH!!!
      const r = target.parentElement.rowIndex - 1 // for the TH
      this.setState({focus: {r, c}})
      const { exec } = this.props
      if(exec) exec(r, c, e)
    }
    window.focus(e.target)
  }
  render() {
    const { renderItem } = this.props
    return (
      <table tabIndex="0" className='px-grid' onKeyDown={this.handleKey} onClick={this.handleClick} onSelectStart={e => e.preventDefault()}>
        <tbody>
          <tr>
            <th></th>
            {cols.map(c => <th key={c}>{1+c}</th>)}
          </tr>
          {rows.map(r => (
            <tr>
              <th>{1+r}</th>
              {cols.map(c => (
                <td {...this.focused(r,c)} >{renderItem(r,c)}</td>
              ))}
            </tr>
          ) )}
        </tbody>
      </table>
    );
  }
}

export default PixelGrid
