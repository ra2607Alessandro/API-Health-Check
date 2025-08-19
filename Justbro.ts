import { triggerAsyncId } from 'async_hooks';
import { resolve } from 'path';
import { createInterface } from 'readline';

const rl = createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.prompt();

interface APIs {
    url: string
    name: string
    entity: string
    provider?: string
    
    status?: "active" | "inactive" 
}

interface Dashboard {
    apis: number
    Internal: number
    thirdParty: number
    active: number | undefined
    inactive: number | undefined
    
}
//step 1: Add API
async function addAPI(): Promise<APIs | null> {
     

    const userInput = await new Promise<string>((resolve) => {
    rl.question("You want to add a new API?: yes/no? : ", resolve);
    });

    const entityAPI = await new Promise<string>((resolve) => {
        rl.question("Is the API internal/external? : ", resolve);
    });
    const nameAPI = await new Promise<string>((resolve) => {
        rl.question("Enter the API's name: ", resolve)
    })
    const urlAPI = await new Promise<string> ((resolve) => {
        rl.question("Enter your Api's url: ", resolve)
    })
    
    
    
    
    const proceed = userInput.trim().toLowerCase();
    if (proceed === "no") {
        return null
    }
    if (proceed !== "yes" && proceed !== "no") {
        throw new Error("Invalid answer. It's either yes or no that you have to type, dummie!"); 
    

    }
    const proceed2 = entityAPI.trim().toLowerCase();
    if (proceed2 !== "internal" && proceed2 !== "external") {
        throw new Error("Invalid answer. It's either yes or no that you have to type, dummie!");

    }
    let providerAPI; // Declare the variable first
    if (proceed2 === "external") {
    providerAPI = await new Promise<string>((resolve) => {
        rl.question("Enter the API provider's name: ", resolve);
    });}

    return {
        name: nameAPI.trim(),
        url: urlAPI.trim(),
        entity: proceed2, // <- Use proceed2 instead of entityAPI.trim()
        provider: providerAPI?.trim() 

    }
      }
        
type poppa = ReturnType<typeof addAPI>  // This gets the return type: APIs | null  // This is what addAPI returns
const Database : APIs[] = []

// This should be OUTSIDE the function

async function APItoDatabase(pop: poppa): Promise<typeof Database | null> {
    const ss = await pop
    if ( ss !== null) 
        Database.push(ss)  // Push first
        return Database     // Then return the array
    }



// Option A: Pass the API object directly
async function APIstatus(data: typeof Database): Promise<APIs["status"] | void>  {
    
    if ( data.length === 0 )  {
        throw new Error; }
   
    // Now add logic to handle the input
    else {
    const userInput = await new Promise<string>((resolve) => {
        rl.question("Enter API name and URL to update (format: name, url): ", resolve);
    });

    // Parse the input
    const parts = userInput.split(',');
    if (parts.length !== 2) {
        throw new Error("Invalid format. Please use: name, url (use this specific order and the ',' between them)");
    }

    const apiName = parts[0].trim();
    const apiUrl = parts[1].trim();

    // Step 4 & 5: Search Database for matching API
    const foundAPI = data.find(api => 
        api.name === apiName && api.url === apiUrl
    );

    if (!foundAPI) {
        throw new Error("API not found in database");
    }

    // Step 6: Ask for status
    const statusInput = await new Promise<string>((resolve) => {
        rl.question("Enter status (active or inactive): ", resolve);
    });

    // Step 7: Validate status input
    const newStatus = statusInput.trim().toLowerCase();
    if (newStatus !== "active" && newStatus !== "inactive") {
        throw new Error("Invalid status. Please enter 'active' or 'inactive'");
    }

    // Step 8: Update the API in database
    foundAPI.status = newStatus as "active" | "inactive";

    // Step 9: Return  updated status
    return foundAPI.status;}}
// Remove the readline import

async function DatabasetoDashboard(database: typeof Database ): Promise<Dashboard>{
    
   
    
    const int : APIs[]    = database.filter(internal => internal.entity === "internal")
    const ext : APIs[] = database.filter(internal => internal.entity === "external")

        return {
            apis:database.length ,
            Internal: int.length, 
            thirdParty: ext.length,
            active: database.filter(api => api.status === "active").length ,
            inactive: database.filter(api => api.status === "inactive").length,
            
        }

}


type dash =  ReturnType<typeof DatabasetoDashboard>

    

async function displayDashboard(Display: dash): Promise<void> {
    const display = await Display
    console.log('\n📊 DASHBOARD:');
    console.log('==========================================');
    console.log(`📈 Total APIs: ${ display.apis}`);
    console.log(` Internal APIs: ${display.Internal}`);
    console.log(` External APIs: ${display.thirdParty}`);
    console.log(` Active APIs: ${display.active}`);;
    console.log(` Inactive APIs: ${display.inactive}` )

}

async function main() {
     try {
        const ask = await addAPI();
        
        if (ask === null) {
            return console.log("No API added. Exiting.");
            ;
        }
        
        // Add to database
        const push = await APItoDatabase(Promise.resolve(ask));
        
        if (push === null) {
            return console.log("Failed to add to database");
            ;
        }
        
        // Create dashboard data
        const dashboardData = DatabasetoDashboard(Database);
        
        if (dashboardData === null) {
            return console.log("Failed to create dashboard");
            ;
        }
        
        // Ask user about API status
        const statusQuestion = await new Promise<string>((resolve) => {
            rl.question("Do you want to set API status? yes/no: ", resolve);
        });
        
        if (statusQuestion.trim().toLowerCase() === "yes") {
            await APIstatus(Database);
            // Update dashboard with new status
            const updatedDashboard = DatabasetoDashboard(Database);
            if (updatedDashboard) {
                displayDashboard(updatedDashboard);
            }
        } else {
            displayDashboard(dashboardData);
        }
        
        rl.close();
        
    } catch (error) {
        console.log("An error occurred:", error);
        rl.close();
        // Error handling
    }
}

// ✅ Run the program (proper way)
main();
