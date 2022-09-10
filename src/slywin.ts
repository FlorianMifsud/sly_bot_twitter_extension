import { TwitterApi } from "twitter-api-v2";
import * as dotenv from "dotenv";
dotenv.config();
const userClient = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY,
    appSecret: process.env.TWITTER_API_SECRET_KEY,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

const main = async () => {
    /*const jsTweets = await userClient.v2.searchAll("slywin");

    for await (const tweet of jsTweets) {
        console.log(tweet);
    }
    */

    const followers = await userClient.v2.followers("1550150234814160896", {
        "user.fields": [
            "created_at",
            "description",
            "entities",
            "id",
            "location",
            "name",
            "pinned_tweet_id",
            "profile_image_url",
            "protected",
            "public_metrics",
            "url",
            "username",
            "verified",
            "withheld",
        ],
    });
    followers.data.forEach((follower) => {
        console.log(follower.profile_image_url);
    });
    /*for (const list of myLists) {
        const members = await userClient.v1.listMembers({
            list_id: list.id_str,
        });

        for await (const user of members) {
            console.log(user);
        }
    }*/
};

main();
