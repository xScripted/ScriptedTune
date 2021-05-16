module.exports = {
    pluginOptions: {
        electronBuilder: {
            nodeIntegration: true,
            chainWebpackRendererProcess(config) {
                config.plugins.delete('workbox')
                config.plugins.delete('pwa')
            }
        }
    },
    css: {
        loaderOptions: {
            sass: {
                prependData: `@import "@/assets/sass/global.scss";`
            }
        }
    },
    configureWebpack: {
        devServer: {
            watchOptions: {
                ignored: [/public/]
            }
        }
    }

}