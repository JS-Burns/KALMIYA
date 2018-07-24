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
