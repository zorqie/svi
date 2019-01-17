import { Component } from 'inferno'

export default //function contentEditable(WrappedComponent) {

  /*return*/ class Editable extends Component {

    state = {
      editing: false
    }

    toggleEdit = (e) => {
      if(e.ctrlKey) return;
      e.stopPropagation()
      if (this.state.editing) {
        this.cancel()
      } else {
        this.edit()
      }
    }

    edit = () => {
      this.setState({
        editing: true
      }, () => {
        this.domElm.focus()
      })
    }

    save = () => {
      this.setState({
        editing: false
      }, () => {
        if (this.props.onSave && this.isValueChanged()) {
          console.log('Value is changed', this.props.initialValue, '->', this.state.value)
          this.props.onSave(this.state.value)
        }
      })
    }

    cancel = () => {
      this.setState({
        editing: false
      })
    }

    isValueChanged = () => {
      return this.props.initialValue !== this.state.value
    }

    handleKeyDown = (e) => {
      const { key } = e
      switch (key) {
        case 'Enter':
        case 'Escape':
          this.save()
          break
      }
    }
    handleInput = e => {
      const { innerText } = e.target
      this.setState({value:innerText})
    }

    render() {
      let editOnClick = true;
      const {editing} = this.state;
      if (this.props.editOnClick !== undefined) {
        editOnClick = this.props.editOnClick;
      }
      let val = this.state.value || this.props.initialValue
      return (
        <td
          className={editing ? 'editing' : ''}
          onClick={editOnClick ? this.toggleEdit : undefined}
          contentEditable={editing}
          ref={domNode => this.domElm = domNode}
          onBlur={this.save}
          onKeyDown={this.handleKeyDown}
          onInput={this.handleInput}
      >
        {val}
      </td>
      )
    }
  }
//}
