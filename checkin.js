async function login(host1, email, password) {
  try {
    const host = host1 || 'ikuuu.one'
    const formData = new URLSearchParams({
      host: host,
      email: email,
      passwd: password,
      remember_me: 'on',
      code: ''
    });

    const url = "https://"+host+"/auth/login"
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "accept": "application/json, text/javascript, */*; q=0.01",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "x-requested-with": "XMLHttpRequest",
      },
      body: formData.toString()
    });

    const setCookieHeader = response.headers.get('set-cookie');
    if (!setCookieHeader) {
      throw new Error('No set-cookie header found');
    }

    const cookieParts = setCookieHeader.split(', ')
      .filter(part => /^(uid|email|key|ip|expire_in)=/.test(part))
      .map(part => part.split(';')[0]);

    const cookie = cookieParts.join('; ');
    // console.log('Generated cookie:', cookie);

    return cookie;
  } catch (error) {
    console.error(`Login failed for ${email}:`, error.message);
    return null;
  }
}

async function checkin(host2, cookies) {
  try {
    const host = host2 || 'ikuuu.one'
    
    const url = "https://"+host+"/user/checkin"
    const response = await fetch(url, {
      headers: {
        "accept": "application/json, text/javascript, */*; q=0.01",
        "x-requested-with": "XMLHttpRequest",
        "cookie": cookies,
      },
      method: "POST"
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Checkin failed:', error);
    return null;
  }
}

async function processAccount(account) {
  console.log(`Processing account: ${account.email}`);

  const cookies = await login(account.host, account.email, account.password);
  if (!cookies) {
    console.log(`Failed to login for account: ${account.email}`);
    return;
  }

  const checkinResult = await checkin(account.host,cookies);
  if (checkinResult) {
    console.log(`Checkin result for ${account.email}:`, checkinResult);
  }
}

async function main() {
  const accountsJson = process.env.ACCOUNTS;
  if (!accountsJson) {
    console.error('No accounts found in environment variable');
    return;
  }

  let accounts;
  try {
    accounts = JSON.parse(accountsJson);
  } catch (error) {
    console.error('Failed to parse accounts JSON:', error);
    return;
  }

  for (const account of accounts) {
    await processAccount(account);
    // Add a small delay between accounts
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

main().catch(console.error);
