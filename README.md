# ShipFast — Javascript

Hey maker 👋 it's Marc from [ShipFast](https://shipfa.st/docs). Let's get your startup off the ground, FAST ⚡️

<sub>**Watch/Star the repo to be notified when updates are pushed**</sub>

## Get Started

1. Follow the [Get Started Tutorial](https://shipfa.st/docs) to clone the repo and run your local server 💻

<sub>**Looking for the /pages router version?** Use this [documentation](https://shipfa.st/docs-old) instead</sub>

2. Follow the [Ship In 5 Minutes Tutorial](https://shipfa.st/docs/tutorials/ship-in-5-minutes) to learn the foundation and ship your app quickly ⚡️

## Links

- [📚 Documentation](https://shipfa.st/docs)
- [📣 Updates](https://shipfast.beehiiv.com/)
- [🧑‍💻 Discord](https://shipfa.st/dashboard)
- [🥇 Leaderboard](https://shipfa.st/leaderboard)

## Support

Reach out at marc@shipfa.st

\_

Let's ship it, FAST ⚡️

P.S.

- Want to showcase your startups? Get your [Indie Page](https://indiepa.ge?ref=shipfast_readme) and share your entrepreneur's journey. Join 3,132 founders ⭐️
- Don't get banned from Stripe for 1 dispute. Use [ByeDispute](https://byedispute.com/?ref=shipfast_readme) to prevent them from happenening 🛡️
- Make your launch go viral and get your first customers with [LaunchViral](https://launchvir.al/?ref=shipfast_readme) 🚀
- Stop paying 0.4% per Stripe invoices [Zenvoice](https://zenvoice.io/?ref=shipfast_readme) 🤕

return (
<div key={idx} className="grid grid-cols-4 gap-2 border-t py-2">
<div className="text-[#118ab2] font-bold col-span-2">
{player
? `${position} - ${player.full_name} (${player.position})`
: `Unknown Player (${starterId}) - ${position}`}
</div>

              <div className="text-[#55a630] items-center justify-center flex">
                {positionRank}
              </div>
              <div className="items-center justify-center flex">
                <p className="text-[#2b9348] ">{adp}</p>
              </div>
            </div>
          );
        })}
        <div className="grid grid-cols-4 gap-2 border-t py-2 font-bold">
          <div clasName="">
            <h2>Total ADP</h2>
          </div>
          <div></div>
          <div></div>
          <div className="text-[#ffff3f] flex justify-center items-center">
            {totalAdp.toFixed(2)}
          </div>
        </div>
      </div>
    </div>

);
