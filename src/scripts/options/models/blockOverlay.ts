export class BlockOverlay {
    public text: string;
    public color: string;
    public opacity: number;

    constructor(text: string, color: string, opacity: number) {
        this.text = text;
        this.color = color;
        this.opacity = opacity;
    }

    public getElement(): HTMLElement {
        const blockOverlayContainer = document.createElement('div');
        blockOverlayContainer.classList.add('block-overlay');
        blockOverlayContainer.style.setProperty('background', this.color);
        const color = this.convertToRgba(this.color, this.opacity);
        blockOverlayContainer.style.setProperty(
            'background-color',
            `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`,
        );
        const text = document.createElement('p');
        text.innerText = this.text;
        blockOverlayContainer.appendChild(text);
        return blockOverlayContainer;
    }

    public convertToRgba(hex: string, opacity: number) {
        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
        const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
            ? {
                  a: opacity,
                  b: parseInt(result[3], 16),
                  g: parseInt(result[2], 16),
                  r: parseInt(result[1], 16),
              }
            : null;
    }
}
