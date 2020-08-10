const fs = require('fs').promises
const dedent = require('dedent')
const camelcase = require('camelcase')
const { promisify } = require('util')
const rimraf = promisify(require('rimraf'))
const svgr = require('@svgr/core').default

function svgToReact(svg, componentName) {
  return svgr(svg, {
      native: true
  }, { componentName })
}

console.log('Building React Native components...')

rimraf('./react-native/outline/*')
  .then(() => {
    return rimraf('./react-natve/solid/*')
  })
  .then(() => {
    return Promise.all([
      fs.readdir('./solid').then((files) => {
        return Promise.all(
          files.map((file) => {
            const componentName = `${camelcase(file.replace(/\.svg$/, ''), { pascalCase: true })}`
            return fs
              .readFile(`./solid/${file}`, 'utf8')
              .then((content) => {
                return svgToReact(content, `${componentName}Icon`)
              })
              .then((component) => {
                const fileName = `${componentName}.jsx`
                const content = component
                return fs.writeFile(`./react-native/solid/${fileName}`, content).then(() => fileName)
              })
          })
        ).then((fileNames) => {
          const exportStatements = fileNames
            .map((fileName) => {
              const componentName = `${camelcase(fileName.replace(/\.jsx$/, ''), {
                pascalCase: true,
              })}`
              return `export { default as ${componentName} } from './${fileName}'`
            })
            .join('\n')

          return fs.writeFile('./react-native/solid/index.js', exportStatements)
        })
      }),

      fs.readdir('./outline').then((files) => {
        return Promise.all(
          files.map((file) => {
            const componentName = `${camelcase(file.replace(/\.svg$/, ''), { pascalCase: true })}`
            return fs
              .readFile(`./outline/${file}`, 'utf8')
              .then((content) => {
                return svgToReact(content, `${componentName}Icon`)
              })
              .then((component) => {
                const fileName = `${componentName}.jsx`
                const content = component
                return fs.writeFile(`./react-native/outline/${fileName}`, content).then(() => fileName)
              })
          })
        ).then((fileNames) => {
          const exportStatements = fileNames
            .map((fileName) => {
              const componentName = `${camelcase(fileName.replace(/\.jsx$/, ''), {
                pascalCase: true,
              })}`
              return `export { default as ${componentName} } from './${fileName}'`
            })
            .join('\n')

          return fs.writeFile('./react-native/outline/index.js', exportStatements)
        })
      }),
    ])
  })
  .then(() => console.log('Finished building React Native components.'))
