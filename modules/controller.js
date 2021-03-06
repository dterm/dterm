import assert from 'dat://dfurl.hashbase.io/modules/assert.js'
import ready from '../vendor/document-ready-v2.0.2.js'
import nanobus from '../vendor/nanobus-v4.4.0.js'
import nanomorph from '../vendor/nanomorph-v5.1.3.js'

export default function control () {
  return new ElementController(...arguments)
}

class ElementController {
  constructor (selector) {
    this.bus = nanobus()
    this.init = []
    this.selector = selector
    this.state = {}
  }

  emit () {
    this.bus.emit(...arguments)
  }

  mount (selector) {
    ready(() => {
      this.el = document.querySelector(selector || this.selector)
      this.el.controller = this
      this.el.isSameNode = target => target.controller === this
      delete this.selector
    })

    this.init.forEach(store => store(this.state))
    Object.seal(this.state)
    delete this.init
  }

  render () {
    if (this.el === undefined) {
      return ready(this.render.bind(this))
    }
    let page = this.factory(this.state, this.emit.bind(this))
    assert(page instanceof Element, 'view must return Element')
    nanomorph(this.el, page)
  }

  use (fn) {
    assert(typeof fn === 'function', 'store must be function')
    this.init.push(state => fn(state, this.bus, this))
  }

  view (fn) {
    assert(typeof fn === 'function', 'view must be function')
    this.factory = fn
  }
}
