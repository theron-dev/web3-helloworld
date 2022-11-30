
export type EventFunction = (name: string, ...args: any[]) => void

export class Event {
    protected _events: {
        [key: string]: EventFunction[]
    } = {}

    on(name: string, fn: EventFunction): void {
        let vs = this._events[name]
        if (vs === undefined) {
            this._events[name] = [fn]
        } else {
            vs.push(fn)
        }
    }

    off(name?: string, fn?: EventFunction): void {
        if (name === undefined && fn === undefined) {
            this._events = {}
        } else if (fn === undefined) {
            delete this._events[name!]
        } else if (fn === undefined) {
            for (let key in this._events) {
                let vs = this._events[key]
                for (let i = 0; i < vs.length; i++) {
                    if (vs[i] === fn) {
                        vs.splice(i, 1)
                        i--
                    }
                }
            }
        } else {
            let vs = this._events[name!]
            if (vs !== undefined) {
                for (let i = 0; i < vs.length; i++) {
                    if (vs[i] === fn) {
                        vs.splice(i, 1)
                        i--
                    }
                }
                if (vs.length === 0) {
                    delete this._events[name!]
                }
            }
        }
    }

    emit(name: string, ...args: any[]): void {
        let vs = this._events[name]
        if (vs !== undefined) {
            for (let v of vs.slice()) {
                v(name, ...args)
            }
        }
    }
}