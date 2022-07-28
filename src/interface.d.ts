export interface STREAMER_Interface {
    NAME: string;
    TWITTER: string;
    SURNOM: Array<string>;
}
export interface Twitch_Interface {
    id: string;
    user_id: string;
    user_login: string;
    user_name: string;
    game_id: string;
    game_name: string;
    type: string;
    title: string;
    viewer_count: number;
    started_at: string;
    language: string;
    thumbnail_url: string;
    tag_ids: Array<string>;
    is_mature: boolean;
}
export interface Twitch_Last_Vod_Interface {
    duration: string;
    url: string;
}
export interface Data_Interface {
    STREAMER: string;
    TWITCH_INFO: Twitch_Interface;
    LAST_DATA: LAST_DATE_Interface;
    MODO_INFO: STREAMER_Interface;
}

export interface LAST_DATE_Interface {
    today: Date;
    current_streamer: string;
    switch_hours: number;
    next_streamer: string;
}
