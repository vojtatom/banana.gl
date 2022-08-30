import { GraphicsProps } from "./context";

export function SourceLabel(props: GraphicsProps) {
    const container = document.createElement('div');
    container.id = "BananaGLContainer";
    const parent = props.canvas.parentElement;
    if (!parent)
    return;
    
    parent.style.position = 'relative';
    parent.insertBefore(container, props.canvas);
    parent.removeChild(props.canvas);
    container.appendChild(props.canvas);

    const label = document.createElement('div');
    label.style.position = 'absolute';
    label.style.bottom = '0';
    label.style.right = '10px';
    label.style.background = props.invertCopyrightColor ? '#111111' : '#ffffff';
    label.style.color = props.invertCopyrightColor ? '#FFFFFF' : '#000000';
    label.style.fontSize = '10px';
    label.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif';
    label.style.borderRadius = '5px 5px 0 0';
    label.style.padding = '2px 5px';
    const year = new Date().getFullYear();



    const sources = document.createElement('a');
    sources.href = 'https://api.metacity.cc';
    sources.innerText = 'Metacity Data API';
    sources.style.fontFamily = 'inherit';
    sources.style.fontSize = 'inherit';
    sources.style.color = 'inherit';
    sources.style.background = 'inherit';
    sources.style.padding = '0';
    sources.style.textDecoration = 'underline';

    const home = sources.cloneNode(true) as HTMLAnchorElement;
    home.href = 'https://metacity.cc';
    home.innerText = 'Metacity';

    label.innerHTML = `&copy; ${year} ${home.outerHTML}, Source: ${sources.outerHTML}`;
    container.appendChild(label);

    return container;
}
