module.exports = {
    apps: [
        {
            script: "./dist/index.js",
            watch: ".",
        },
    ],

    deploy: {
        production: {
            user: "solary",
            host: "dev.florianmifsud.eu",
            ref: "origin/master",
            repo: "https://github.com/FlorianMifsud/sly_bot_twitter_extension.git",
            path: "/home/solary/twitter",
            "pre-deploy-local": "",
            "post-deploy":
                "pnpm i --production && pnpm run build && pm2 reload ecosystem.config.js --env production",
            "pre-setup": "",
        },
    },
};
