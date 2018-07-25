export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
    return new Promise((res, rej) => {
        canvas.toBlob(async blob => {
            if (!blob) {
              rej(new Error(`Error occurred when attempting to create Blob from canavas.`))
              return
            }
            
            res(blob)
        })
    })
}

export function chooseRandom <T>(xs: T[]): T {
    if (xs.length === 0) {
        throw new Error(`You called choose random, with an empty list.  List must not be empty.`)
    }

    const randomIndex = Math.floor(Math.random() * xs.length)

    return xs[randomIndex]
}