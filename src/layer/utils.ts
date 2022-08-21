

export function median(arr: number[]) {
    arr.sort();
    const mid = Math.floor(arr.length / 2);
    if (arr.length % 2)
        return arr[mid];
    return (arr[mid - 1] + arr[mid]) / 2;
}

export function layoutUrl(base: string) {
    return `${base}/layout.json`;
}

export function notLoadedError(path: string) {
    `Could not load layout for layer ${path}`;
}