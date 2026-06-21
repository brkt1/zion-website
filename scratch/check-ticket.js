const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqaG52dGVnb2FydmRxYWtxcWtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1OTEwNjcsImV4cCI6MjA3ODE2NzA2N30.psUwlT7mj-N9p4JN2DByHLnayrIkoeBdI81lcQWgmII";
const ref = "YENEGE-MQN9Y3WSFFJ8ZS26WXD";
const url = `https://zjhnvtegoarvdqakqqkd.supabase.co/rest/v1/tickets?tx_ref=eq.${ref}&select=*`;

fetch(url, {
  headers: {
    "apikey": key,
    "Authorization": "Bearer " + key
  }
}).then(res => res.json().then(data => {
  console.log("Status:", res.status);
  console.log("Tickets found:", data);
})).catch(console.error);
