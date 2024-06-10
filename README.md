This is a set of examples and components for use in Archiquest and World Engine

## Getting Started

First, install Visual Studio code, Node.js and Github Desktop if you haven't already.

Then launch Github desktop and go to File -> Clone Repository. Select the URL tab and enter this repositories git url: `https://github.com/gwyllo/archiquest-next.git`.

Then click Open In Visual Studio to launch visual studio and open the project folder. Alternatively, you can launch visual studio and go File -> Open Folder and navigate to wherever Github Desktop cloned the code to.

In Visual Studio, open the Terminal and make sure that npm (the package manage for installing project dependencies) is correctly set up on your machine by running:

```bash
npm install npm -g
```

Then install the dependencies

```bash
npm install
```

## Adding your keys

Secrets are not saved to github and you will need to add them to the local copy of your code.

Create a new file called `.env.local` in the root directory of the project folder (e.g. under README.md).

In this file, add two environment variables as follows. Replace `your_key` with your API key value. You don't need quotation marks or semicolons at the end of the line - just paste in the key string.

Environment variables in the project use specific names, so make sure you don't have any types and follow these names exactly.

```JS
GROQ=your_key
FAL_KEY=your_key
```

If you want to use other LLMs like OpenAI or Google Gemini (which allows for very large prompts including images) then you will also need to add these API keys:

```JS
GEMINI=your_key
OPENAI=your_key
```

If you want to use Deepgram (for fast test to speech) then add your Deepgram API key

```JS
DEEPGRAM=your_key
```

If you are using Supabase as a database, then you should also add your supabase keys:

```JS
SUPABASE_KEY=your_service_account_key
SUPABASE_URL=your_database_url
```

## Running the project

To start the project on your local machine, open the terminal and run:

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the app by modifying `app/page.tsx`. The page auto-updates when you save changes to your files.

## Saving your work

After you have made changes to the project and you are sure your code runs, you can commit these changes to your own repository in github.

To do this, go back to Github Desktop. You should see some changes highlighted in the code view. In the bottom left corner of the window you will see a message saying that you do not have permissions to commit to this repository and asking whether you would like to create a fork instead. Click create fork, and choose Personal Project when prompted. You're done! Now you have your own copy of the code that you and your group mates can work on together.

Enter a commit message then click commit to confirm your changes.

Then click Push Origin to save the changes back to github so your teammates can Pull (download) them into their own local copies of the code.

## Incorporating changes from your groupmates (or new updates in this repository)

You can Pull (download and merge) changes into your local code.

See this guide for help [Syncing your branch in GitHub Desktop](https://docs.github.com/en/desktop/working-with-your-remote-repository-on-github-or-github-enterprise/syncing-your-branch-in-github-desktop)

## Deploy on Vercel

If you build an app that you would like to publish and allow anyone to play (the goal at the end of semester) you will need to deploy it to the internet.

The simplest way to do this is using a platform called Vercel.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
