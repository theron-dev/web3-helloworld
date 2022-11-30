
export function send(method: string, url: string, data: any, headers?: { [key: string]: string }, responseType?: XMLHttpRequestResponseType): Promise<any> {

    return new Promise<any>((resolve, reject) => {

        let xhr = new XMLHttpRequest()

        xhr.onerror = () => {
            reject(new Error('Please check network settings'))
        }

        xhr.onload = () => {

            if (xhr.status === 200) {

                let contentType = xhr.getResponseHeader('Content-Type') || xhr.getResponseHeader('content-type')

                if (/json/i.test(contentType!)) {
                    try {
                        let data = JSON.parse(xhr.responseText)
                        resolve(data)
                    } catch (e) {
                        reject(e)
                    }
                } else if (/text/i.test(contentType!)) {
                    resolve(xhr.responseText)
                } else {
                    resolve(xhr.response)
                }

                try {
                    let data = JSON.parse(xhr.responseText)
                    if (data.errno === 200) {
                        resolve(data.data)
                    } else {
                        reject(new Error(data.errmsg))
                    }
                }
                catch (e) {
                    reject(new Error(xhr.responseText))
                }

            } else {
                reject(new Error(xhr.responseText || xhr.statusText))
            }

        }

        xhr.open(method, url, true)

        xhr.responseType = responseType || 'text'

        if (headers) {
            for (let key in headers) {
                xhr.setRequestHeader(key, headers[key])
            }
        }

        xhr.send(data)

    })
}