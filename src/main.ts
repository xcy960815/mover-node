import moverNode from './mover-node.vue'
const components = [moverNode]

const install: any = (Vue) => {
    if (install.installed) return
    install.installed = true
    components.forEach((component: any) => {
        Vue.component(component.extendOptions.name, component)
    })
}

if (typeof window !== 'undefined' && (window as any).Vue) {
    install((window as any).Vue)
}

export default {
    install,
}
