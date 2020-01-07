$(function () {
  let johnAptRent = 0  
  let connorAptRent = 0 
  let paulAptRent = 0  
  let currentDate
  
  
  

  clearAddFormFields()  
  updateDate()

  // Fill in your firebase project's information below:
  const firebaseConfig = {
     apiKey: "AIzaSyC_WmV8KgPUvkwwEdqFdBnJPvOoAQQ87HI",
     authDomain: "playlist-app-4e766.firebaseapp.com",
     databaseURL: "https://playlist-app-4e766.firebaseio.com",
     projectId: "playlist-app-4e766",
     storageBucket: "playlist-app-4e766.appspot.com",
     messagingSenderId: "152937945652",
     appId: "1:152937945652:web:f2db26af44538e39174861"
   };
   // Initialize Firebase
  firebase.initializeApp(firebaseConfig)

   // Using Firebase API to get references to "rent" collection
  const dbRentAmounts = firebase.firestore().collection("rent2020")
  

  
  
  // -------- **CREATE** ---------

  // listen for submit event on Add New Song form
  $('#song-form').submit((event) => {    
    event.preventDefault()
    const aptRent = $('#apartment-rent').val()
    const powerBill = $('#power').val()
    const aptUtil = $("#apartment-util").val()  
    const rentMonth = $("#current-date").html()
    const billsArray = [aptRent, powerBill, aptUtil, rentMonth]

    if (rentMonth === currentDate) {
      console.log("yes", rentMonth, currentDate)
    } else {
      console.log("no", rentMonth, currentDate)
    }

    
    

    

    duplicateMonthCheck(billsArray)

    
    
    
    // creates document in firestore
    // Firebase API adding new song using .add()
      dbRentAmounts.add ({
        aptRent: aptRent,
        aptUtil: aptUtil,
        powerBill: powerBill,
        rentMonth: rentMonth

      })

    clearAddFormFields()
  })

  // -------- **READ** ---------
  dbRentAmounts.orderBy('rentMonth', 'desc').onSnapshot((snapshot) => {    
    

    // Clears list
    $(".rent").html("")

    console.log("snapshot")

    snapshot.forEach((doc) => {
      const songId = doc.id
      const aptRent = doc.data().aptRent
      const powerBill = doc.data().powerBill
      const aptUtil = doc.data().aptUtil
      const dbMonth = doc.data().rentMonth
      const playlistItemHtml = buildSongItemHtml(aptRent, powerBill, aptUtil)
      console.log(`this is dbMonth from snapshot ${dbMonth}`)

      currentDate = dbMonth
      
      $('.rent').append (
        `
        <div class="song" id="${songId}">
          ${playlistItemHtml}
        </div>
        `
      )      
    })

  })

  // Updates the date on the Page on load
  function updateDate () {    
        
    let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    let yyyy = today.getFullYear();  
    today = mm + '/' + yyyy
    
    $('#current-date').html(`${today}`)
    
    return today
  }
  
  


  // -------- **UPDATE** ---------

  // listen for click event on the "edit" button
  $('body').on('click', 'button.edit-song', (event) => {
    const selectedSongId = $(event.currentTarget).parent().parent().attr('id')
    const selectedSongName = $(event.currentTarget).parent().parent().find('.apt-rent').text()
    const selectedArtistName = $(event.currentTarget).parent().parent().find('.powerbill').text()

    console.log(selectedSongId)
    console.log(selectedSongName)
    console.log(selectedArtistName)

    const formHtml = buildEditFormHtml(selectedSongId, selectedSongName, selectedArtistName)

    $(event.currentTarget).parent().parent().html(formHtml)
  })

  // listen for click event on the "cancel" (edit) link
  $('body').on('click', '.song .cancel-edit', (event) => {
    const songId = $(event.currentTarget).parent().find('#song-id').val()
    const songName = $(event.currentTarget).parent().find('#update-apt-rent').val()
    const artistName = $(event.currentTarget).parent().find('#update-powerbill').val()

   

    const playlistItemHtml = buildSongItemHtml(songName, artistName)

    $(event.currentTarget).parent().parent().html(playlistItemHtml)
  })

  // listen for the submit event for update song form
  $('body').on('submit', '#update-song-form', (event) => {
    event.preventDefault()

    const songId = $(event.currentTarget).parent().find('#song-id').val()
    const updatedSongName = $(event.currentTarget).parent().find('#update-apt-rent').val()
    const updatedArtistName = $(event.currentTarget).parent().find('#update-powerbill').val()

    console.log(songId)
    console.log(updatedSongName)
    console.log(updatedArtistName)

    dbRentAmounts.doc(songId).update({
      songName: updatedSongName,
      artistName: updatedArtistName
    })

    // const playlistItemHtml = buildSongItemHtml(updatedSongName, updatedArtistName)
    //
    // $(event.currentTarget).parent().html(playlistItemHtml)
  })

  // -------- **DELETE** ---------

  // listen for click event on the "delete" button
  $('body').on('click', 'button.delete-song', (event) => {

    // grab ID of song that user wants to delete from firebase
    const songId = $(event.currentTarget).parent().parent().attr('id')
    console.log(event.currentTarget)
    console.log(songId)

    // use jquery to remove element from UI
    $(event.currentTarget).parent().parent().remove()

    // firebase API delete song using .delete()
    dbRentAmounts.doc(songId).delete()
  })

  // -------- Utility Functions ---------

  // calculates the rent amounts
  // **** hardcoded fixed rate amounts ****
  function rentCalc (aptRent) {
    johnAptRent = (aptRent * .36).toFixed(2)  
    connorAptRent = (aptRent * .33).toFixed(2)  
    paulAptRent = (aptRent * .31).toFixed(2)
    
    
    return (johnAptRent, connorAptRent, paulAptRent)
  }

  

  // html template for Edit Song Form
  function buildEditFormHtml (songId, songName, artistName) {
    return (
      `
        <form id="update-song-form">
          <p>Update Song</p>
          <input type="text" id="update-apt-rent" value="${songName}"/>
          <input type="text" id="update-powerbill" value="${artistName}"/>
          <input type="hidden" id="song-id" value="${songId}"/>
          <button>Update Song</button>
          <a href="#" class="cancel-edit"> cancel </a>
        </form>
      `
    )
  }

  // html template for a Song Item
  function buildSongItemHtml (aptRent, powerBill, aptUtil) {
    rentCalc(aptRent)
    powerBillSplit(powerBill)
    aptUtilitiesSplit(aptUtil)
    

    return (
      `
        <div>
        <h3>John's Rent Due</h3>
        <p>Apartment Rent: $<span class="apt-rent">${johnAptRent}</span></p>
        <p>Apartment Utilities: $<span class="apt-util">${aptUtilThird}</span></p>
        <p>GA Power Bill: $<span class="powerbill">${powerBill}</span></p>
        </div>
        <div>
        <h3>Connor's Rent Due</h3>
        <p>Apartment Rent: $<span class="apt-rent">${connorAptRent}</span></p>
        <p>Apartment Utilities: $<span class="apt-util">${aptUtilThird}</span></p>
        <p>GA Power Bill: $<span class="powerbill">${powerBill}</span></p>
        </div>
        <div>
        <h3>Paul's Rent Due</h3>
        <p>Apartment Rent: $<span class="apt-rent">${paulAptRent}</span></p>
        <p>Apartment Utilities: $<span class="apt-util">${aptUtilThird}</span></p>
        <p>GA Power Bill: $<span class="powerbill">${powerBill}</span></p>
        </div>        

        <div class="actions">
          <button class="edit-song">edit</a>
          <button class="delete-song">delete</a>
        </div>
      `
    )
  }

  // Clear text fields on Add New Song form
  function clearAddFormFields () {
    $('#apartment-rent').val('')
    $('#apartment-util').val('')
    $('#power').val('')
  }

  // Updates the date on the Page on load
  function updateDate () { 
    let today = new Date()        
    let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    let yyyy = today.getFullYear()

    today = mm + '/' + yyyy

    $('#current-date').html(`${today}`)
    return (today)
  } 

  // Splits Power Bill into Thirds
  function powerBillSplit (powerBill) {
    powerBillThird = powerBill * .33
    return powerBillThird
  } 

  // Splits Apartment Utilities into Thirds
  function aptUtilitiesSplit (aptUtil) {
      aptUtilThird = aptUtil * .33
      return aptUtilThird
  }

  function duplicateMonthCheck (billsArray) {
    
    console.log(currentDate)

    
    // if (rentMonth[3] === today) {
    //   alert("Rent for this month is Entered, Edit or Delete entry")
    //   return
    // } else {
    //   // creates document in firestore
    // // Firebase API adding new song using .add()
    // dbRentAmounts.add ({
    //   aptRent: aptRent,
    //   aptUtil: aptUtil,
    //   powerBill: powerBill,
    //   rentMonth: rentMonth

    // })
    // }
  }
  
})
