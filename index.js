require('dotenv').config();
const { Client, GatewayIntentBits, PermissionFlagsBits } = require('discord.js');
const OpenAI = require('openai');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration
  ]
});

const openai = new OpenAI({
  apiKey: process.env.XAI_API_KEY,
  baseURL: 'https://api.x.ai/v1'
});

client.once('ready', () => {
  console.log(`✅ Bobby شغال! ${client.user.tag}`);
  client.user.setActivity('بوبي معاكم 🔥', { type: 3 });
});

// ===== دردشة AI =====
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.mentions.has(client.user) || message.content.startsWith('!ai')) {
    const prompt = message.content
      .replace(`<@${client.user.id}>`, '')
      .replace('!ai', '')
      .trim();

    if (!prompt) return message.reply('قولي عايز إيه يا صاحبي 👀');

    try {
      await message.channel.sendTyping();
      const completion = await openai.chat.completions.create({
        model: 'grok-4',
        messages: [
          {
            role: 'system',
            content: 'أنت بوبي، بوت ديسكورد ودود ومرح. رد باللهجة المصرية الخفيفة وكن مفيد.'
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 800
      });
      await message.reply(completion.choices[0].message.content);
    } catch (error) {
      console.error(error);
      message.reply('حصلت مشكلة في الذكاء الاصطناعي 😢');
    }
  }
});

// ===== أوامر المودريشن والألعاب =====
client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.content.startsWith('!')) return;

  const args = message.content.slice(1).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  // بان
  if (command === 'ban') {
    if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) return message.reply('معندكش صلاحية');
    const member = message.mentions.members.first();
    if (!member) return message.reply('منشن الشخص');
    const reason = args.slice(1).join(' ') || 'مفيش سبب';
    try {
      await member.ban({ reason });
      message.reply(`تم حظر **${member.user.tag}**`);
    } catch {
      message.reply('مقدرش أعمل بان');
    }
  }

  // كيك
  if (command === 'kick') {
    if (!message.member.permissions.has(PermissionFlagsBits.KickMembers)) return message.reply('معندكش صلاحية');
    const member = message.mentions.members.first();
    if (!member) return message.reply('منشن الشخص');
    try {
      await member.kick();
      message.reply(`تم طرد **${member.user.tag}**`);
    } catch {
      message.reply('مقدرش أطرده');
    }
  }

  // ميوت
  if (command === 'mute') {
    if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) return message.reply('معندكش صلاحية');
    const member = message.mentions.members.first();
    if (!member) return message.reply('منشن الشخص');
    const minutes = parseInt(args[1]) || 10;
    try {
      await member.timeout(minutes * 60 * 1000);
      message.reply(`تم ميوت **${member.user.tag}** لمدة ${minutes} دقيقة`);
    } catch {
      message.reply('مقدرش أعمل ميوت');
    }
  }

  // مسح رسائل
  if (command === 'clear') {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) return message.reply('معندكش صلاحية');
    const amount = parseInt(args[0]) || 10;
    if (amount < 1 || amount > 100) return message.reply('حط رقم من 1 لـ 100');
    await message.channel.bulkDelete(amount, true);
    const msg = await message.channel.send(`تم مسح ${amount} رسالة`);
    setTimeout(() => msg.delete(), 3000);
  }

  // نرد
  if (command === 'نرد' || command === 'dice') {
    const result = Math.floor(Math.random() * 6) + 1;
    message.reply(`🎲 النرد: **${result}**`);
  }

  // عملة
  if (command === 'عملة' || command === 'coin') {
    const result = Math.random() < 0.5 ? 'ملك' : 'كتابة';
    message.reply(`🪙 **${result}**`);
  }

  // حجر ورقة مقص
  if (command === 'حجر') {
    const choices = ['حجر', 'ورقة', 'مقص'];
    const botChoice = choices[Math.floor(Math.random() * 3)];
    const userChoice = args[0];
    if (!choices.includes(userChoice)) return message.reply('اكتب: `!حجر حجر` أو `!حجر ورقة` أو `!حجر مقص`');

    let result = 'تعادل 😐';
    if (
      (userChoice === 'حجر' && botChoice === 'مقص') ||
      (userChoice === 'ورقة' && botChoice === 'حجر') ||
      (userChoice === 'مقص' && botChoice === 'ورقة')
    ) result = 'أنت كسبت! 🎉';
    else if (userChoice !== botChoice) result = 'أنا كسبت 😎';

    message.reply(`أنت: **\( {userChoice}** | أنا: ** \){botChoice}**\n${result}`);
  }

  // سؤال
  if (command === 'سؤال') {
    const questions = [
      { q: 'عاصمة مصر؟', a: 'القاهرة' },
      { q: 'كام كوكب في المجموعة الشمسية؟', a: '8' },
      { q: 'مين كتب أولاد حارتنا؟', a: 'نجيب محفوظ' }
    ];
    const random = questions[Math.floor(Math.random() * questions.length)];
    message.reply(`❓ \( {random.q}\nالإجابة: || \){random.a}||`);
  }
});

client.login(process.env.DISCORD_TOKEN);
