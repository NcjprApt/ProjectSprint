// NO IMPORTS — React is auto-injected by your bundler
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import Child from "./child";
import Home from "./Components/Home";



export function render(root, props) {

  const Snapshot = () => {


    return (
      <div style={{height:"100%",padding:0,margin:0}}>

        <Child/>

      </div>
    

    );
  };

  const rootNode = ReactDOM.createRoot(root);
  rootNode.render(<Snapshot />);
  root.__plugin_root = rootNode;
}


//REQUIRED TO LET HOST REMOVE PLUGIN
export function unmount(root) {
  if (root.__plugin_root) {
    root.__plugin_root.unmount();
  }
}

window.renderMyPlugin = render;
window.unmountMyPlugin = unmount;

