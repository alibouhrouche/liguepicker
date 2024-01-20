import { Component } from "react";
import { createPortal } from "react-dom";

type Props = {
    children: React.ReactNode,
    style?: string
}

export class Popup extends Component<Props> {
    container: HTMLDivElement
    win: Window | null
    constructor(props: Props) {
      super(props);
      console.log(props)
      // Step 1: create a container <div>
      this.container = document.createElement('div');
      this.win = null;
    }
  
    render() {
      // Step 2: append props.children to the container <div> that isn't mounted yet
      return createPortal(this.props.children, this.container);
    }
  
    componentDidMount() {
      // Step 3: open a new browser window and store a reference to it
      this.win = window.open('', '', 'width=600,height=400,left=200,top=200');
      document.querySelectorAll("style").forEach(el => {
          this.win?.document.head.appendChild(el.cloneNode(true));
      })

      if(this.props.style){
          const s = document.createElement("style");
          s.textContent = this.props.style
          this.win?.document.head.appendChild(s)
      }

      // Step 4: append the container <div> (that has props.chi.dren append to it) to 
      // the body of the new MyWindowPortal
      this.win?.document.body.appendChild(this.container);
    }
  
    componentWillUnmount() {
      // Step 5: This will fire when this.state.showWindowPortal in the parent componentDidMount
      // become false. So we tidy up by closing the window
      this.win?.close();
    }
  }