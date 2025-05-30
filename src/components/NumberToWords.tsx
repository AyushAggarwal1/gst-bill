export default function NumberToWords(num: number): string {
  const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  function convertLessThanOneThousand(n: number): string {
    if (n === 0) return '';
    if (n < 20) return units[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + units[n % 10] : '');
    return units[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convertLessThanOneThousand(n % 100) : '');
  }

  if (num === 0) {
    return 'Zero Rupees Only';
  }

  // Get integer and decimal parts
  let rupeesValue = Math.floor(num);
  const paise = Math.round((num - rupeesValue) * 100);

  let result = '';
  
    if (rupeesValue >= 10000000) {
      result += convertLessThanOneThousand(Math.floor(rupeesValue / 10000000)) + ' Crore ';
      rupeesValue %= 10000000;
    }
    
    if (rupeesValue >= 100000) {
      result += convertLessThanOneThousand(Math.floor(rupeesValue / 100000)) + ' Lakh ';
      rupeesValue %= 100000;
    }
    
    if (rupeesValue >= 1000) {
      result += convertLessThanOneThousand(Math.floor(rupeesValue / 1000)) + ' Thousand ';
      rupeesValue %= 1000;
    }
    
    if (rupeesValue > 0) {
      result += convertLessThanOneThousand(rupeesValue);
    }
    
  result += (rupeesValue > 0 || paise > 0) ? (rupeesValue > 0 ? ' Rupees' : '') : 'Zero Rupees';
  
  if (paise > 0) {
    result += (rupeesValue > 0 ? ' and ' : '') + convertLessThanOneThousand(paise) + ' Paise';
  }
  
  return result.trim() + ' Only';
}