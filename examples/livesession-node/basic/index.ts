import livesession from "livesession";

const ls = new livesession(
    livesession.optionApiKey(process.env.LIVESESSION_API_KEY)
);

(async () => {
    const websites = await ls.websites.list()

    console.log(websites)
})();