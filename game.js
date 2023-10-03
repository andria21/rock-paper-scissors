import readline from "readline";
import { randomBytes, createHmac } from "crypto";

function generateHMAC(key, message) {
  const hmac = createHmac("sha256", key);
  hmac.update(message);
  return hmac.digest("hex");
}

function playGame(choices, userChoice, key) {
  const randomIndex = Math.floor(Math.random() * choices.length);
  const randomChoice = choices[randomIndex];

  console.log(`Your Move: ${userChoice}`);
  console.log(`Computer's Move: ${randomChoice}`);

  const halfNextMoves = choices.slice(randomIndex + 1).length;
  const halfPrevMoves = choices.slice(0, randomIndex).length;

  if (userChoice === randomChoice) {
    console.log("Draw.");
  } else if (halfNextMoves > halfPrevMoves) {
    console.log("You won!");
  } else {
    console.log("You lost.");
  }
  console.log(`HMAC: ${generateHMAC(key, userChoice)}`);
}

function displayHelp(choices) {
  console.log("Options:");
  console.log("0 - Exit");
  console.log("? - Help");

  console.log("Available moves:");
  choices.forEach((choice, index) => {
    console.log(`${index} - ${choice}`);
  });
  console.log("0 - Exit");
  console.log("? - Help");

  console.log("\nWinning Moves Table:");
  printWinningMovesTable(choices);
}

function printWinningMovesTable(choices) {
  const tableHeader = ["v PC\\User >", ...choices];
  const table = [];

  for (const playerChoice of choices) {
    const row = [playerChoice];
    for (const computerChoice of choices) {
      if (playerChoice === computerChoice) {
        row.push("Draw");
      } else if (
        (choices.indexOf(playerChoice) + 1) % choices.length ===
        choices.indexOf(computerChoice)
      ) {
        row.push("Win");
      } else {
        row.push("Lose");
      }
    }
    table.push(row);
  }

  const colWidths = choices.map((choice) => choice.length);
  colWidths.unshift("v PC\\User >".length);

  console.log(
    tableHeader
      .map((header, index) => header.padEnd(colWidths[index]))
      .join(" | ")
  );
  console.log(
    "-".repeat(colWidths.reduce((sum, width) => sum + width + 3, 0) - 1)
  );

  for (const row of table) {
    console.log(
      row.map((cell, index) => cell.padEnd(colWidths[index])).join(" | ")
    );
    console.log(
      "-".repeat(colWidths.reduce((sum, width) => sum + width + 3, 0) - 1)
    );
  }
}

const args = process.argv.slice(2);
const randomKey = randomBytes(256 / 8).toString("hex");

function hasDuplicates(array) {
  return new Set(array).size !== array.length;
}

if (args.length <= 2) {
  console.log("Please enter at least 3 names");
} else if (hasDuplicates(args)) {
  console.log("Please enter unique names, duplicates are not allowed.");
} else {
  const choices = args;
  console.log(`HMAC: ${generateHMAC(randomKey, "Initial HMAC")}`);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  function getUserChoice() {
    console.log("Available moves:");
    choices.forEach((choice, index) => {
      console.log(`♯ ${index + 1} - ${choice} ▶`);
    });
    console.log("♯ 0 - Exit ▶");
    console.log("♯ ? - Help ▶");

    rl.question("Enter your move: ", (selectedOption) => {
      if (selectedOption === "?") {
        displayHelp(choices);
        getUserChoice();
      } else if (selectedOption === "0") {
        rl.close();
      } else {
        const selectedIndex = parseInt(selectedOption) - 1;
        if (selectedIndex >= 0 && selectedIndex < choices.length) {
          const userChoice = choices[selectedIndex];
          rl.close();
          playGame(choices, userChoice, randomKey);
        } else {
          console.log(
            "\n- Invalid choice or option. Please enter a valid choice number or option. -"
          );
          getUserChoice();
        }
      }
    });
  }

  getUserChoice();
}
