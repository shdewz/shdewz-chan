# shdewz-chan (slave-market version)

Private (currently) javascript discord bot to be used in osu! tournaments with a team drafting format.

## Functions

#### Setup commands: (`< >` required, `[ ]` optional)

+ `!captains add <captain_1> ...` Adds captain(s) to the list. Use their osu! usernames, replacing any spaces with underscores `_`.
+ `!captains remove <captain_1> ...` Removes captain(s) from the list.
+ `!captains clear` Clears the entire list of captains.
+ `!captains list` Displays a list of all captains along with their available money.

Same commands may be used for players by starting with `!players`. Additional player-based commands include:
+ `!players sold` Displays a list of sold players, their owners and the sell price.
+ `!players set-unsold [player1]` Sets player(s) to unsold state. Defaults to everyone. Use before starting an auction.


#### Other commands:

+ `!money [captain]` Displays your or the specified captain's available money.
+ `!roll [max]` Returns a random integer between 1 and 100 (or specified max) similarly to osu!'s !roll function.

## To-do

+ Config commands, such as changing the command prefix and currency.
+ The actual bidding process and the related commands
+ Displaying users' osu! stats
+ Some optimization

## Requirements

+ [Node.js](https://nodejs.org/en/)
+ [Git](https://git-scm.com/)
+ Discord bot created [here](https://discordapp.com/developers/applications/) for more realistic testing
+ A `config.json` file made as follows:
```json
{
    "prefix": "!",
    "token": "your discord app token here",
    "apikey": "osu api key, not used yet so no need",
    "currency": "coins",
    "startmoney": 15000
}
```

+ Preferably a more advanced text editor such as [Visual Studio Code](https://code.visualstudio.com/)
+ A functioning brain
+ And probably something else that I just forgot

## Contributing

#### Download the source
In an empty directory, do
```shell
git clone https://github.com/shdewz/shdewz-chan.git
cd shdewz-chan
```

Make sure to switch to the **slave-market** branch!

To fetch the latest update, use
```shell
git pull
```
