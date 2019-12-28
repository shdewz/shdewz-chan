# shdewz-chan (slave-market version)

Private (currently) javascript discord bot to be used in osu! tournaments with a team drafting format.

## Working functions

#### Setup commands: (`< >` required, `[ ]` optional)

+ `!captains.add <captain> <badges>` Adds captain to the list. Use their osu! usernames, replacing any spaces with underscores `_`.
+ `!captains.remove <captain_1> ...` Removes captain(s) from the list.
+ `!captains.clear` Clears the entire list of captains.
+ `!captains.list [captain]` Displays a list of all (or one of the) captains along with their available money.

The `.remove`, `.clear` and `.list` commands work the same way for players. Additional player commands are:
+ `!players.add <player> <badges> ""<reason to be picked>""` Adds player with a reason enclosed in double-double quotes. Do this one by one and replace spaces with underscores `_`. Converting sheets straight to JSON recommended instead of this for large player counts.
+ `!players.sold` Displays a list of sold players, their owners and the sell price.
+ `!players.set-unsold [player1] ...` Sets player(s) to unsold state. Defaults to everyone. Do this once all players have been added.

#### Bidding commands:
+ `!bid.draw` Draws a random unsold player from the list and displays their stats.
+ `!bid.start <player>` Starts bidding on the specified player. No spaces.
+ `<value>` Bids on a player. Captain accessible during bidding.

#### Other commands:

+ `!money [captain]` Displays your or the specified captain's available money.
+ `!roll [max]` Returns a random integer between 1 and 100 (or specified max) similarly to osu!'s !roll function.
+ `!stats <username>` Displays simple osu! statistics.
+ `!stats.random` Displays a random tournament player's osu !statistics.
+ `!me` Displays your tourney stats (player and captain accessible). Same function as `!captains.list` and `!players.list`.
+ `!set <username>` Links your discord account to a specified player. Required for captains, optional for players.
