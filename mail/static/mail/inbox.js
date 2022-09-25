document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');

  // Define what to do with JS to compose-form
  document.querySelector('#compose-form').onsubmit = send_email

});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#individual-email-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#individual-email-view').style.display = 'none';

  capitalized_mailbox_name = `${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}`
  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${capitalized_mailbox_name}</h3>`;

  // Add the name of the mailbox to the title
  document.querySelector('title').innerHTML = capitalized_mailbox_name

  // Query the API for the lastest emails in the mailbox
  const apy_query = `/emails/${mailbox}`
  fetch(apy_query)
  .then(response => response.json())
  .then(emails => {
      emails.forEach(email => {
        id = email.id
        sender = email.sender
        recipients = email.recipients
        subject = email.subject
        body = email.body
        timestamp = email.timestamp
        read = email.read
        archived = email.archived

        // Create frames to show the data

        const sender_frame = document.createElement('div')
        sender_frame.classList.add('col-2', 'sender_frame')
        sender_frame.innerHTML = sender

        const subject_frame = document.createElement('div')
        subject_frame.classList.add('col-7')
        subject_frame.innerHTML = subject

        const timestamp_frame = document.createElement('div')
        timestamp_frame.classList.add('col-3', 'timestamp_frame')
        timestamp_frame.innerHTML = timestamp

        const email_frame = document.createElement('div')
        email_frame.classList.add('row', 'email_frame')
        // Set a data attribute to access the id of the email
        // Because when I pass the id directly to the function,
        // then all the div listers end up using the ID of the last email
        email_frame.setAttribute('data-id', id)
        email_frame.append(sender_frame, subject_frame, timestamp_frame)

        // If email is read, it appears with a gray background
        if (read) {email_frame.style.background = 'gray'}
        
        // Add a click handler to the email_frame
        email_frame.addEventListener('click', function () {click_email(this.dataset.id, mailbox)})

        // Append the <div> to the body
        document.querySelector('#emails-view').append(email_frame)
      });
  });

}


function send_email() {
  // Get the data from the form
  const recipients = document.querySelector('#compose-recipients').value
  const subject = document.querySelector('#compose-subject').value
  const body = document.querySelector('#compose-body').value
  console.log(`Data read: ${recipients} ${subject} ${body}`)

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
      /* 
      I put the load_mailbox function here
      because sometimes the mailbox would be loaded BEFORE the email was actually sent,
      so the email would not apper in the mailbox
     */
      load_mailbox('sent')
  });

  // I need the form not to reload the page
  return false
}

function click_email(id, mailbox) {
  query = `/emails/${id}`
  fetch(query)
  .then(response => response.json())
  .then(email => {
      
    // Hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#individual-email-view').style.display = 'block';
    
    // Construct individual email frame to show the data
      // Clean from previous emails
    document.querySelector('#individual-email-view').innerHTML = ''
    
    const sender_frame = document.createElement('p')
    sender_frame.innerHTML = `<b>From:</b> ${email.sender}`
    
    const recipients_frame = document.createElement('p')
    recipients_frame.innerHTML = `<b>To:</b> ${email.recipients}`

    const subject_frame = document.createElement('p')
    subject_frame.innerHTML = `<b>Subject:</b> ${email.subject}`

    const timestamp_frame = document.createElement('p')
    timestamp_frame.innerHTML = `<b>Timestamp:</b> ${email.timestamp}`

    const body_frame = document.createElement('p')
    body_frame.innerHTML = email.body

    const archive_toggler = document.createElement('button')
    archive_text = ''
    if (mailbox == 'inbox') {archive_text = 'Archive'}
    if (mailbox == 'archive') {archive_text = 'Unarchive'}
    if (mailbox != 'sent' && archive_text) {
      archive_toggler.innerHTML = archive_text
      archive_toggler.classList.add('btn', 'btn-sm', 'btn-outline-primary')
      archive_toggler.addEventListener('click', () => {toggle_archive(email.id, email.archived)})
      document.querySelector('#individual-email-view').append(archive_toggler)  
    }
    
    // Create button to reply
    const reply = document.createElement('button')
    reply.innerHTML = 'Reply'
    reply.classList.add('btn', 'btn-sm', 'btn-outline-primary')
    reply.addEventListener('click', () => {reply_email(email.sender, email.subject, email.timestamp, email.body)})

    hr = document.createElement('hr')
    document.querySelector('#individual-email-view').append(sender_frame, recipients_frame, subject_frame, timestamp_frame, reply, hr, body_frame)

  });  

  // Mark the email as read
  fetch(query, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })
  
}

function toggle_archive(id, archived) {

  query = `/emails/${id}`
  fetch(query, {
    method: 'PUT',
    body: JSON.stringify({
        archived: !archived
    })
  })
  .then(()=> {load_mailbox('inbox')})
}

function reply_email(recipient, subject, timestamp, body) {
  
  compose_email()
  document.querySelector('#compose-recipients').value = recipient
  // Check if subject begins with 'Re: '
  console.log(subject.slice(0,4))
  if ( subject.slice(0,4) === 'Re: ' ){
    document.querySelector('#compose-subject').value = subject
  } else {
    document.querySelector('#compose-subject').value = `Re: ${subject}`
  }
  document.querySelector('#compose-body').value = `On ${timestamp} ${recipient} wrote: ${body}`
}
