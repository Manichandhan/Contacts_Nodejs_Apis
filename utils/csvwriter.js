const createCsvWriter = require("csv-writer").createObjectCsvWriter;

async function csvWriter(data,username) {
  const csvwriter = createCsvWriter({
    path: `./usersContacts/${username}contacts.csv`,
    header: [
      { id:"name", title:"name"},
      { id:"contact", title:"contact"}
    ],
    append: true,
    
  });

  csvwriter
    .writeRecords(data)
    .then(() => {
      console.log("written succesfully");
    })
    .catch((err) => {
      console.log(err);
    });
} 
//csvWriter([{name:'name',contacts:'contact'},{name:'joseph',contacts:9492703307},{name:'maroof',contacts:8374566788},{name:'rajsharma',contacts:9618113710}])
module.exports={csvWriter}