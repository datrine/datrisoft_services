const withCSS = require('@zeit/next-css')

module.exports = {
    cssModules: true,
    webpack: config => {
        let { rules } = config.module
        console.log(rules)
        rules.push(
            {
                test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                loader: 'file-loader',
                options:
                {
                    outputPath: 'static/webfonts/',
                    publicPath: '../webfonts/',
                    // optional, just to prettify file names
                    name: '[name].[ext]',
                },
            },
            // ...
        );
        return config;
    },
}

/*module.exports = withCSS({
  cssModules:true,
  webpack: (config,options) => {
    config.module.rules.push(
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'file-loader',
            outputPath: 'static/webfonts/',
            publicPath: '../webfonts/',
            // optional, just to prettify file names
            name: '[name].[ext]',
          },
        ],
      },
      // ...
    );
    return config;
  },
})*/
