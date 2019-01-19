import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import * as helper from '../misc/helperFunctions';
import { Mouse } from '../misc/mouse';

/*
  cartoon genome
*/
@connect((state)=>({
  visibleGenome: state.genomeInfo.visibleGenome,
  genomeLength: state.genomeInfo.genomeLength,
}))
export class Cartoon extends React.Component {
  static propTypes = {
    visibleGenome: PropTypes.arrayOf(PropTypes.number).isRequired,
    genomeLength: PropTypes.number.isRequired,
    style: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
  }
  constructor(...args) {
    super(...args);

    this.initCanvasXY = helper.initCanvasXY;
    this.clearCanvas = helper.clearCanvas;

    this.resizeFn = () => {this.forceUpdate();};

    this.svgdraw = () => {
      this.canvasPos = this.canvas.getBoundingClientRect();
      console.log('printing cartoon to SVG');
      window.svgCtx.save();
      window.svgCtx.translate(this.canvasPos.left, this.canvasPos.top);
      window.svgCtx.rect(0, 0, this.canvasPos.right - this.canvasPos.left, this.canvasPos.bottom - this.canvasPos.top);
      window.svgCtx.stroke();
      window.svgCtx.clip();
      this.redraw(window.svgCtx, this.props);
      window.svgCtx.restore();
    };

    this.redraw = (context, props) => {
      const gutter = 10; // pixels of blank space on either side
      const yMiddle = parseInt(this.canvas.height / 2, 10);
      const xStartLine  = gutter;
      const xLineFinish = parseInt(this.canvas.width, 10) - gutter;
      const xLineLength = parseInt(this.canvas.width, 10) - 2 * gutter;
      const xViewStart = parseInt(props.visibleGenome[0] / props.genomeLength * xLineLength + xStartLine, 10);
      let xViewLength = parseInt((props.visibleGenome[1] - props.visibleGenome[0]) / props.genomeLength * xLineLength, 10);
      if (xViewLength < 1) {
        xViewLength = 1;
      }

      context.save();
      context.translate(0.5, 0.5);
      // draw a horizontal line
      context.strokeStyle = 'black';
      context.lineWidth = 1;

      context.beginPath();
      context.moveTo(xStartLine, yMiddle);
      context.lineTo(xLineFinish, yMiddle);
      context.stroke();

      // shade a box

      context.globalAlpha = 0.2;

      context.fillStyle = 'black';
      context.fillRect(xViewStart, parseInt(this.canvas.height / 4, 10), xViewLength, parseInt(this.canvas.height / 2, 10));
      context.globalAlpha = 1;

      context.restore();
    };
  }

  componentDidMount() {
    this.mouse = new Mouse(this.canvas, this.props.dispatch, function () { }, true); // set up listeners
    this.initCanvasXY(); // expensive way to handle resizing
    this.redraw(this.canvas.getContext('2d'), this.props);
    window.addEventListener('pdf', this.svgdraw, false);
    window.addEventListener('resize', this.resizeFn, false);
  }

  componentWillUpdate(props) {
    this.initCanvasXY(); // expensive way to handle resizing
    this.clearCanvas(); // needed????
    this.redraw(this.canvas.getContext('2d'), props);
  }

  componentWillUnmount() {
    window.removeEventListener('pdf', this.svgdraw, false);
    window.removeEventListener('resize', this.resizeFn, false);
  }

  render() {
    return (
      <div>
        <canvas
          id="Blocks"
          ref={(c) => {this.canvas = c;}}
          style={this.props.style}
        />
      </div>
    );
  }
}
