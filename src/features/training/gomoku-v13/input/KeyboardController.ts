import { BoardPoint } from "../domain/gomokuTypes";
import { ViewportController } from "../world/ViewportController";

export class KeyboardController {
  private cursor: BoardPoint = { x: 0, y: 0 };
  private viewportController: ViewportController;
  private onPlace: (point: BoardPoint) => void;
  private onUpdateCursor: (cursor: BoardPoint) => void;
  private onCenter: () => void;
  private onLatestMove: () => void;
  private onRequestRender: () => void;

  constructor(
    viewportController: ViewportController,
    onPlace: (point: BoardPoint) => void,
    onUpdateCursor: (cursor: BoardPoint) => void,
    onCenter: () => void,
    onLatestMove: () => void,
    onRequestRender: () => void
  ) {
    this.viewportController = viewportController;
    this.onPlace = onPlace;
    this.onUpdateCursor = onUpdateCursor;
    this.onCenter = onCenter;
    this.onLatestMove = onLatestMove;
    this.onRequestRender = onRequestRender;
  }

  public getCursor(): BoardPoint {
    return this.cursor;
  }

  public setCursor(p: BoardPoint): void {
    this.cursor = p;
    this.onUpdateCursor(this.cursor);
    this.onRequestRender();
  }

  public handleKeyDown = (e: KeyboardEvent): boolean => {
    const step = e.shiftKey ? 5 : 1;
    let handled = false;

    switch (e.key) {
      case "ArrowUp":
        this.cursor = { x: this.cursor.x, y: this.cursor.y - step };
        handled = true;
        break;
      case "ArrowDown":
        this.cursor = { x: this.cursor.x, y: this.cursor.y + step };
        handled = true;
        break;
      case "ArrowLeft":
        this.cursor = { x: this.cursor.x - step, y: this.cursor.y };
        handled = true;
        break;
      case "ArrowRight":
        this.cursor = { x: this.cursor.x + step, y: this.cursor.y };
        handled = true;
        break;
      case "Enter":
      case " ":
        this.onPlace(this.cursor);
        handled = true;
        break;
      case "c":
      case "C":
        this.onCenter();
        handled = true;
        break;
      case "l":
      case "L":
        this.onLatestMove();
        handled = true;
        break;
      case "+":
      case "=":
        this.viewportController.zoomAtCss(
          window.innerWidth / 2,
          window.innerHeight / 2,
          1.2
        );
        this.onRequestRender();
        handled = true;
        break;
      case "-":
      case "_":
        this.viewportController.zoomAtCss(
          window.innerWidth / 2,
          window.innerHeight / 2,
          1 / 1.2
        );
        this.onRequestRender();
        handled = true;
        break;
    }

    if (handled) {
      this.onUpdateCursor(this.cursor);
      this.onRequestRender();
    }

    return handled;
  };
}
