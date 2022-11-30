
export function getErrmsg(e: any): string {
    if (e && e.code) {
        return e.message
    }
    if (e && e.errno) {
        return e.errmsg
    }
    if (e && e.message) {
        if (/originalError/i.test(e.message)) {
            return e.message.split('\n')[0]
        }
        return e.message
    }
    if (e && e.stack) {
        return e.stack
    }
    return e + ''
}
