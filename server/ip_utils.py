import re
from typing import Optional

def esconder_ip(ip: Optional[str], mode: str = "partial", mask_char: str = "*") -> str:
    """
    Função para mascarar/esconder o endereço IP de aparelhos ou conexões.
    
    Parâmetros:
      - ip (str): O endereço IP original (IPv4 ou IPv6).
      - mode (str): 
          - 'partial' (padrão): Esconde os 2 últimos octetos do IPv4 (ex: 177.38.87.59 -> 177.38.***.***)
          - 'last_octet': Esconde apenas o último octeto (ex: 177.38.87.59 -> 177.38.87.***)
          - 'full': Esconde o IP completo (ex: 177.38.87.59 -> ***.***.***.***)
      - mask_char (str): Caractere usado para mascarar (padrão '*'). Pode ser 'x', 'X', '*', etc.
      
    Retorno:
      - str: Endereço IP mascarado ou mensagem padrão para conexões não identificadas.
    """
    if not ip or not isinstance(ip, str):
        return "IP Oculto"
    
    ip_clean = ip.strip()
    
    # Caso especial: conexões locais, websockets sem IP exposto ou valores genéricos
    if ip_clean.lower() in ["websocket", "unknown", "localhost", "127.0.0.1", "::1", "none", "null"]:
        return "Local/Oculto"
    
    # Checa se é IPv4 (formato X.X.X.X)
    ipv4_pattern = r'^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$'
    match_v4 = re.match(ipv4_pattern, ip_clean)
    
    if match_v4:
        o1, o2, o3, o4 = match_v4.groups()
        mask3 = mask_char * len(o3)
        mask4 = mask_char * len(o4)
        
        if mode == "last_octet":
            return f"{o1}.{o2}.{o3}.{mask4}"
        elif mode == "full":
            return f"{mask_char * len(o1)}.{mask_char * len(o2)}.{mask3}.{mask4}"
        else:
            # modo partial (padrão): esconde os 2 últimos octetos
            return f"{o1}.{o2}.{mask3}.{mask4}"
            
    # Checa se é IPv6 (contém dois ou mais dois pontos ':')
    if ":" in ip_clean:
        parts = ip_clean.split(":")
        if len(parts) >= 2:
            if mode == "full":
                return ":".join([mask_char * len(p) if p else "" for p in parts])
            else:
                # Mantém os 2 primeiros blocos e oculta o restante
                visible = parts[:2]
                masked_count = len(parts) - 2
                return ":".join(visible) + ":" + ":".join([mask_char * 4] * masked_count)
                
    # Fallback caso não corresponda estritamente a IPv4/IPv6 conhecidos
    if len(ip_clean) <= 6:
        return mask_char * len(ip_clean)
    return ip_clean[:3] + mask_char * (len(ip_clean) - 6) + ip_clean[-3:]


# Alias em inglês para facilidade de importação
mask_ip = esconder_ip
