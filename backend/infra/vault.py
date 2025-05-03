import base64

import httpx
from config import get_settings


async def encrypt_vault_data(text: str, encryption_key: str) -> dict:
    vault_url = get_settings().VAULT_ADDR
    vault_token = get_settings().VAULT_TOKEN
    vault_encryption_key = encryption_key
    plaintext = base64.b64encode(text.encode("utf-8")).decode("utf-8")
    endpoint = f"{vault_url}/v1/transit/encrypt/{vault_encryption_key}"
    if not vault_url or not vault_token:
        raise ValueError(
            "VAULT_ADDR and VAULT_TOKEN must be set in environment variables"
        )
    client = httpx.AsyncClient(verify=False)
    print(endpoint, vault_token, vault_encryption_key)
    try:
        response = await client.post(
            endpoint,
            headers={"x-vault-token": vault_token},
            data={"plaintext": plaintext},
        )
        response.raise_for_status()
        await client.aclose()
        return response.json()
    except httpx.RequestError as e:
        raise ValueError(f"Failed to encrypt API data: {e}")
    except Exception as e:
        raise ValueError(f"Internal Server Error: {e}")
    finally:
        await client.aclose()
