import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { HERO_VISUAL_PROFILES as profiles } from '../../src/features/entertainment/ngu_dai_de_vuong/data/heroVisualProfiles';
const require = createRequire(import.meta.url);
const sharp = require(process.argv[2] || 'sharp');
const root = 'public/assets/ngu-dai-de-vuong';
const P = (d: string, fill = 'url(#metal)', stroke = '#142634', w = 2.5) => `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
const L = (d: string, color = 'var(--accent)', w = 3) => P(d, 'none', color, w);
const E = (x:number,y:number,rx:number,ry:number,c='var(--accent)') => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${c}"/>`;
const R = (x:number,y:number,r:number,c='var(--accent)',w=3) => `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${c}" stroke-width="${w}"/>`;
const group = (s:string, transform:string) => `<g transform="${transform}">${s}</g>`;
const feather = (x:number,y:number,angle:number,size=1,c='var(--main)') => group(P('M0 0 Q-32 -52 -8 -111 Q30 -78 0 0Z',c)+L('M0 -5 L-6 -95','var(--accent)',1.8),'translate('+x+' '+y+') rotate('+angle+') scale('+size+')');
const petals = (x:number,y:number,count:number,r:number,c='var(--main)') => Array.from({length:count},(_,i)=>group(P(`M0 0 Q${-r*.65} ${-r*.7} 0 ${-r} Q${r*.65} ${-r*.7} 0 0Z`,c,'var(--accent)',1.5),`translate(${x} ${y}) rotate(${360*i/count})`)).join('');
const star = (x:number,y:number,r:number,c='var(--accent)') => P(`M${x} ${y-r} L${x+r*.23} ${y-r*.23} ${x+r} ${y} ${x+r*.23} ${y+r*.23} ${x} ${y+r} ${x-r*.23} ${y+r*.23} ${x-r} ${y} ${x-r*.23} ${y-r*.23}Z`,c,'none');
const flame = (x:number,y:number,size=1,c='var(--accent)') => group(P('M0 0 Q-37 -24 -15 -55 Q-18 -28 0 -43 Q29 -78 8 -105 Q63 -65 33 -27 Q23 -5 0 0Z',c,'var(--main)',2),`translate(${x} ${y}) scale(${size})`);
const blade = (d:string) => P(d,'url(#blade)','var(--accent)',3);
type Layers = Record<string,string>;
// Authored anatomy, garments and weapons, not palette swaps of the old template.
const art: Record<string, () => Partial<Layers>> = {
 H001:()=>({
  torso:P('M110 188 L149 150 222 146 275 179 290 264 251 326 133 326 96 262Z')+P('M126 190 L163 180 150 246 115 244Z','var(--dark)')+L('M177 168 L189 207 164 235 185 287 M238 173 L219 220 249 264 M132 296 L159 280 175 313','var(--accent)',5)+P('M134 219 L153 203 167 227 144 239Z','var(--moss)')+P('M224 281 L261 266 248 299Z','var(--moss)'),
  head:P('M159 93 L184 72 219 79 237 109 228 154 185 173 153 143Z')+L('M168 120 L187 117 M209 115 L223 118','#c0d6a2',5)+P('M191 125 L187 144 208 144','var(--dark)')+L('M180 152 L216 151','var(--accent)',4),
  hairFront:P('M154 109 L135 86 153 75 164 42 183 68 216 47 242 83 230 106Z','var(--dark)')+P('M148 82 L168 66 179 87Z','var(--moss)'),
  cape:P('M114 176 L72 199 54 307 109 336 126 266Z','var(--dark)')+L('M72 232 L96 208 98 278','var(--accent)',5),
  weapon:P('M263 164 L338 151 365 181 352 337 309 362 263 334 251 213Z','url(#metal)','var(--accent)',5)+P('M277 194 L331 181 341 308 310 331 280 304Z','var(--dark)')+P('M282 274 L299 224 312 249 324 217 338 279Z','var(--moss)','var(--accent)',3)+L('M286 199 L300 214 290 243 M332 293 L315 307','var(--accent)',3),
  ornament: Array.from({length:7},(_,i)=>E(100+i*25,305+(i%3)*5,6,4,'var(--moss)')).join(''),
 }),
 H002:()=>({
  torso:P('M163 165 Q195 148 227 166 L247 253 228 344 168 355 147 270Z')+P('M166 177 L192 205 222 173 220 243 195 265 169 239Z','var(--dark)')+Array.from({length:5},(_,i)=>L(`M169 ${211+i*19} Q195 ${232+i*19} 223 ${208+i*19}`,'var(--accent)',2)).join(''),
  head:P('M158 110 L173 87 209 86 232 112 237 128 270 139 253 154 215 151 207 167 175 154Z','var(--main)')+E(214,117,8,4,'var(--accent)')+L('M252 151 Q293 147 288 170 M181 148 Q165 195 187 205','var(--accent)',3),
  hairFront:blade('M173 103 L144 54 151 33 162 57 190 85Z')+blade('M205 94 L223 60 243 49 235 72 220 107Z'),
  hairBack:P('M168 100 Q134 126 143 186 Q157 211 142 263 Q180 242 176 185Z','var(--dark)'),
  ribbon:L('M165 177 Q80 129 71 197 Q74 249 136 253 Q151 282 102 317','var(--accent)',10)+L('M220 174 Q280 102 303 154 Q327 191 270 219','var(--main)',7),
  weapon:P('M301 169 Q361 188 355 249 Q351 302 301 326 Q248 290 250 238 Q244 188 301 169Z','var(--main)','var(--accent)',5)+R(302,240,42)+L('M281 267 Q337 261 314 218 Q289 190 275 231 Q288 215 303 235 Q317 254 296 258','var(--accent)',7)+E(313,224,3,4,'#172e46'),
  ornament:petals(196,192,4,19,'var(--accent)'),
 }),
 H003:()=>({
  torso:P('M135 173 Q200 143 247 179 L263 255 231 321 145 313 118 246Z','var(--main)')+P('M133 176 L165 185 146 215 129 207 M228 175 L214 195 243 219 252 204 M141 253 L167 244 161 264 M221 265 L247 249 244 275Z','var(--dark)')+P('M164 203 L216 205 227 267 186 291 157 265Z','url(#metal)'),
  head:P('M143 99 Q154 59 176 88 Q201 68 224 89 Q254 63 254 102 L248 151 219 179 178 174 144 145Z','var(--main)')+P('M158 96 L172 111 161 117 M224 103 L242 91 238 116 M187 89 L198 110 208 84Z','var(--dark)')+E(178,123,8,4,'#f0bb54')+E(226,123,8,4,'#f0bb54')+P('M182 145 Q204 126 224 145 L214 164 192 164Z','#fff4de')+P('M194 142 L213 142 204 152Z','var(--dark)')+L('M155 140 L180 145 M227 146 L256 139','var(--dark)',2),
  hairFront:'', hairBack:'', cape:'',
  tail:L('M151 292 Q63 354 79 263 Q90 245 106 263','var(--main)',18)+L('M84 307 L97 310 M83 280 L98 278','var(--dark)',8),
  weapon:P('M273 181 L333 183 360 235 337 304 302 324 269 302 248 235Z','var(--accent)','var(--dark)',4)+P('M272 220 L278 203 294 223 309 214 326 220 341 204 345 235 327 277 292 281 272 256Z','var(--main)')+L('M282 231 L297 240 M332 231 L317 241 M300 266 L319 266','var(--dark)',5)+P('M295 251 L324 251 311 263Z','var(--dark)'),
 }),
 H004:()=>({
  cape:P('M120 138 Q45 138 53 261 Q52 341 132 369 L204 342 210 166Z','var(--dark)','var(--accent)',5)+P('M86 200 L121 165 159 188 166 241 124 268 82 241Z','var(--moss)','var(--accent)',4)+L('M87 201 L65 182 M122 166 L122 142 M158 190 L183 177 M124 268 L121 334 M81 241 L59 262','var(--accent)',4)+P('M76 153 L123 119 177 153Z','var(--accent)')+P('M91 134 L121 105 154 135Z','var(--main)'),
  torso:P('M146 190 Q193 159 236 188 Q273 231 254 297 Q228 342 171 320 Q127 290 129 238Z','var(--main)')+P('M170 210 L217 198 243 236 234 282 194 301 159 273 153 235Z','url(#metal)')+L('M161 235 L233 235 M160 259 L241 259 M194 211 L194 291','var(--accent)',2),
  head:P('M181 126 Q227 100 246 136 L271 155 257 171 213 176 183 160Z','var(--main)')+E(232,143,6,4,'var(--accent)')+L('M239 163 L259 163 M195 153 L208 152','var(--dark)',3), hairFront:'', hairBack:'',
  weapon:E(300,272,65,70,'var(--dark)')+R(300,272,60,'var(--accent)',6)+P('M277 243 L310 234 332 260 325 295 294 307 270 281Z','var(--main)','var(--accent)',4)+L('M277 244 L261 229 M312 237 L324 216 M332 260 L355 256 M327 293 L342 310 M293 307 L290 333 M271 280 L248 289','var(--accent)',4),
  ornament:petals(197,250,6,22,'var(--dark)'),
 }),
 H005:()=>({
  torso:P('M150 166 L190 149 232 170 248 241 224 287 244 340 188 317 141 344 154 278 132 222Z')+P('M153 173 L188 205 224 174 215 240 188 267 158 231Z','var(--dark)')+P('M175 209 L200 191 213 220 193 248 183 223Z','var(--accent)'),
  head:P('M166 104 L186 80 216 88 229 120 221 155 196 166 173 148Z','#dcb395')+L('M194 124 L207 123 M218 124 L225 121','var(--dark)',3)+P('M219 139 L232 134 228 152Z','var(--main)'),
  hairFront:P('M164 127 L149 82 175 53 199 69 224 59 241 98 222 123 210 90 184 116Z','var(--dark)')+blade('M175 86 L165 52 176 61 189 87Z')+blade('M216 78 L231 45 231 77Z'),
  cape:P('M144 172 Q92 211 104 278 L51 340 132 319 111 393 164 344 190 296Z','var(--main)','var(--accent)',3),
  weapon:blade('M273 299 L288 301 351 70 337 37 318 68Z')+L('M291 272 L337 78','var(--main)',5)+P('M258 272 L305 284 321 274 307 299 262 288Z','var(--accent)'),
  ribbon:flame(132,343,.6),
 }),
 H006:()=>({
  torso:P('M140 171 L182 151 238 168 259 204 236 242 225 310 153 322 131 252Z','var(--dark)')+P('M135 174 L178 170 186 223 149 256 116 211Z','url(#metal)')+P('M202 166 L240 175 255 220 221 246 189 211Z','var(--main)')+L('M210 175 L223 196 206 211 230 228','var(--accent)',6),
  head:P('M155 97 L183 73 224 89 241 133 219 170 177 160 151 128Z','var(--main)')+P('M168 129 L186 118 194 130 M206 126 L225 116 225 131Z','var(--accent)')+P('M181 144 L219 140 210 160 185 156Z','var(--dark)')+P('M181 140 L189 151 193 139 M215 137 L211 151 207 139Z','#ece3c2'),
  hairFront:P('M151 113 L139 72 158 86 172 56 192 80 218 68 237 101 215 101 191 90Z','#151c2d')+blade('M160 96 L140 40 158 55 177 92Z')+blade('M217 98 L253 60 241 103Z'), hairBack:'',
  weapon:blade('M264 279 L282 280 328 126 346 119 334 92 354 72 328 57 307 132Z')+L('M278 254 L292 208 308 211 315 157','var(--accent)',5),
  cape:P('M132 220 L92 265 104 318 71 364 131 351 148 293Z','var(--dark)'),
 }),
 H007:()=>({
  torso:P('M150 160 L190 147 229 163 244 235 226 280 239 339 196 321 148 339 159 275 134 209Z')+P('M154 175 L187 192 221 173 224 232 193 260 161 229Z','var(--main)','var(--accent)',4)+P('M176 201 L194 181 211 202 194 231Z','var(--accent)')+L('M159 284 L222 284 M155 299 L230 299 M153 315 L234 315','var(--accent)',4),
  head:P('M170 99 L186 87 211 92 225 116 219 148 198 166 175 148Z','#e8c9ad')+L('M184 123 L195 122 M208 121 L219 120','var(--dark)',3),
  hairFront:P('M164 114 L163 82 190 69 220 81 232 105 212 105 197 91 177 115Z','var(--accent)')+P('M178 81 L178 48 195 66 210 45 214 87Z','var(--accent)')+feather(197,54,-20,.7,'var(--main)'),
  cape:P('M147 171 L101 213 87 371 137 392 162 342 164 199Z','var(--dark)','var(--accent)',3)+L('M125 220 L116 346','var(--main)',10),
  weapon:blade('M268 314 L283 314 294 75 277 40 260 77Z')+P('M246 275 L303 275 313 291 238 291Z','var(--accent)')+L('M278 94 L278 256','var(--dark)',4),
 }),
 H008:()=>({
  torso:P('M158 172 Q188 142 222 172 L230 229 200 259 246 316 219 351 181 313 139 350 123 323 160 260 146 217Z','var(--main)')+P('M150 191 L182 227 224 179 222 211 184 250 153 214Z','var(--dark)')+L('M155 262 Q179 276 211 259','var(--accent)',8),
  head:P('M165 109 Q187 85 219 105 L229 134 209 162 180 156 165 136Z','#efc9b4')+E(188,128,6,3,'var(--dark)')+E(219,127,6,3,'var(--dark)'),
  hairFront:P('M158 131 Q143 76 181 75 L210 79 Q245 83 232 131 L216 105 199 114 182 97Z','var(--accent)')+P('M153 95 L148 41 182 84 M218 84 L251 46 242 105Z','var(--main)','var(--accent)',3),
  tail:[[-40,.85],[5,1],[42,.9]].map(([a,s])=>group(P('M0 0 Q-75 3 -66 -83 Q-43 -151 -80 -176 Q4 -152 15 -85 Q45 -17 0 0Z','var(--main)','var(--accent)',3),`translate(148 311) rotate(${a}) scale(${s})`)).join(''),
  weapon:blade('M264 289 Q277 170 329 100 L322 152 Q289 223 278 291Z')+P('M254 265 L290 278 290 289 252 278Z','var(--accent)'), cape:'', ribbon:L('M152 176 Q98 155 113 229 Q121 271 80 310','var(--dark)',13),
 }),
 H009:()=>({
  torso:P('M153 178 L188 158 223 177 233 230 211 269 243 310 207 326 184 297 153 327 134 302 155 256 139 215Z','var(--dark)')+P('M163 177 L189 206 218 180 211 240 180 264 157 235Z','var(--main)')+L('M166 217 L205 244 M202 206 L172 249','var(--accent)',3),
  head:P('M153 109 L177 87 212 92 234 111 228 143 202 163 175 154 151 132Z','var(--main)')+P('M167 126 L185 119 193 131 M205 131 L221 119 224 131Z','var(--accent)')+E(198,142,5,3,'#151c30'),
  hairFront:P('M151 118 L143 62 173 83 197 71 222 90 244 68 239 124 216 104 205 120 183 107 169 123Z','var(--dark)')+P('M152 86 L155 70 169 88 M229 98 L238 83 234 105Z','var(--accent)'),
  tail:L('M155 292 Q105 374 73 324 Q48 296 72 274 Q97 269 91 297','var(--main)',13),
  cape:P('M151 169 Q122 149 98 184 L109 243 83 272 113 266 101 303 141 281 166 204Z','var(--main)'),
  weapon:blade('M266 274 Q332 248 319 194 Q299 231 265 246Z')+blade('M116 279 Q73 294 71 247 L97 261 120 263Z'),
 }),
 H010:()=>({
  torso:P('M161 166 L191 154 220 166 234 245 209 288 225 376 194 349 163 378 171 285 148 228Z','var(--dark)')+P('M164 172 L193 212 219 170 211 264 192 286 171 258Z','var(--main)')+L('M185 222 L198 264','var(--accent)',3)+[222,240,258].map(y=>E(190,y,3,3)).join(''),
  head:P('M172 91 L195 82 218 97 226 124 213 151 199 168 178 146 167 116Z','#dfd1ce')+L('M182 119 L194 123 M208 121 L218 116','var(--main)',3)+P('M198 139 L215 135 209 147 204 143Z','var(--main)'),
  hairFront:P('M168 125 L159 86 184 60 215 70 231 97 220 127 212 95 199 115 181 94Z','var(--dark)'),
  cape:P('M164 163 L133 100 121 170 57 202 94 249 68 324 Q106 299 122 357 Q155 326 168 385 L185 219Z','var(--main)','var(--accent)',3)+P('M218 163 L247 103 268 183 349 223 303 249 335 312 Q285 288 279 347 L211 224Z','var(--dark)','var(--accent)',2),
  weapon:P('M263 261 Q325 194 338 244 Q307 223 286 269 Q317 284 334 259 Q323 311 280 287Z','var(--main)','var(--accent)',4),
  ornament:R(195,182,11)+E(195,182,6,8,'var(--main)'),
 }),
 H011:()=>({
  torso:P('M147 165 L189 142 225 169 235 231 219 289 247 329 221 367 234 406 190 381 170 421 143 383 157 342 125 309 145 250Z','url(#spectral)','var(--accent)',2)+L('M153 193 L178 242 160 306 M215 203 L195 260 220 335','var(--accent)',2),
  head:P('M158 108 L173 78 207 66 236 112 218 155 184 169 157 143Z','var(--dark)','var(--main)',4)+P('M179 111 L218 100 212 145 188 153Z','#112732')+L('M185 128 L211 123','var(--accent)',3),
  hairFront:P('M160 115 L148 90 176 53 212 47 234 85 247 118 222 111 207 79 178 104Z','var(--main)'),
  cape:P('M140 177 Q80 175 100 259 L72 304 113 288 93 351 142 325 159 241Z','url(#spectral)'),
  weapon:blade('M277 253 L309 153 320 127 325 161 292 258Z')+blade('M309 281 L347 222 364 212 360 232 323 292Z')+blade('M254 227 L263 155 276 143 279 164 265 237Z'),
  smoke:L('M182 328 Q121 359 175 393 Q242 431 189 459 M207 366 Q260 390 216 432','var(--accent)',7),
 }),
 H012:()=>({
  torso:P('M159 164 L190 149 222 168 231 229 208 268 235 342 201 328 173 351 145 328 163 266 144 210Z','var(--main)')+P('M161 183 L190 212 218 178 214 235 188 262 161 235Z','url(#metal)')+L('M157 273 L216 273','var(--accent)',7),
  head:P('M170 101 Q194 76 218 98 L230 124 215 154 190 166 171 144Z','#e6c6a9')+L('M187 124 L197 123 M211 121 L220 119','var(--dark)',2.5),
  hairFront:P('M165 121 Q144 87 178 68 Q223 48 235 98 L220 126 208 91 190 105 175 98Z','var(--accent)'),
  wingBack:Array.from({length:8},(_,i)=>feather(157-i*4,209+i*8,-40-i*9,.75,'var(--main)')).join(''),
  wingFront:Array.from({length:5},(_,i)=>feather(221+i*2,200+i*9,35+i*8,.55,'var(--accent)')).join(''),
  weapon:L('M282 79 Q385 238 279 399','var(--accent)',9)+L('M282 79 L278 399','#edf8e4',1.5)+P('M289 109 L307 135 293 151 M289 348 L305 326 295 311Z','var(--main)')+L('M227 263 L346 247','var(--accent)',5)+blade('M344 247 L328 239 331 252Z'),
  cape:'', ribbon:L('M161 176 Q102 202 133 281 Q146 318 105 341','var(--dark)',10),
 }),
 H013:()=>({
  torso:P('M146 167 Q188 146 225 174 L239 226 213 267 224 306 182 331 147 303 156 264 132 218Z','var(--main)')+Array.from({length:7},(_,i)=>feather(161+(i%3)*19,249+Math.floor(i/3)*29,170+(i%3)*12,.38,'var(--dark)')).join(''),
  head:P('M164 105 L186 82 214 95 230 120 257 135 230 144 219 167 184 158 162 135Z','var(--main)')+P('M225 123 L261 135 225 146Z','var(--accent)')+E(211,121,7,5,'#f6dab1'),
  hairFront:[-30,-10,15,35].map((a,i)=>feather(175+i*13,103,a,.52,'var(--dark)')).join(''),
  wingBack:Array.from({length:9},(_,i)=>feather(135,205+i*8,-55-i*7,.9,'var(--main)')).join(''),
  wingFront:Array.from({length:5},(_,i)=>feather(220,192+i*9,55+i*9,.63,'var(--dark)')).join(''),
  weapon:L('M289 132 Q351 186 294 256 Q355 315 287 365','var(--accent)',8)+L('M290 134 L287 363','var(--main)',2)+feather(302,194,135,.4,'var(--dark)')+feather(303,304,28,.4,'var(--dark)'), cape:'',
 }),
 H014:()=>({
  torso:P('M146 166 L188 149 236 166 250 222 234 270 249 322 211 352 181 332 141 347 151 267 127 221Z','var(--dark)')+P('M152 179 L195 172 231 193 216 258 184 278 159 245Z','url(#metal)')+R(194,216,26,'var(--accent)',5)+star(194,216,18,'#ffe8a2'),
  head:P('M167 87 L197 68 222 94 227 143 207 165 178 147Z','url(#metal)')+P('M177 107 L218 107 212 123 182 126Z','var(--dark)')+L('M193 111 L208 111','#ffedb0',4),
  hairFront:'', hairBack:'', halo:R(193,106,65,'var(--accent)',5)+Array.from({length:12},(_,i)=>group(P('M0 -71 L-7 -87 0 -102 7 -87Z','var(--main)','var(--accent)',2),`translate(193 106) rotate(${i*30})`)).join(''),
  weapon:P('M285 99 L327 121 350 173 327 212 317 261 340 299 324 358 281 388 304 333 306 294 279 268 284 232 310 200 319 161Z','var(--main)','var(--accent)',4)+R(304,246,23,'var(--accent)',5)+L('M285 99 L284 388','var(--accent)',2)+star(306,247,15,'#ffe8a2'), cape:'',
 }),
 H015:()=>({
  torso:P('M165 170 L193 153 220 171 229 227 211 255 249 352 226 375 202 343 182 390 162 355 135 372 160 266 150 213Z','url(#spectral)','var(--accent)',3)+P('M176 195 L196 172 216 194 194 245Z','var(--main)','var(--accent)',3)+L('M195 259 L182 349 M208 272 L232 347','var(--accent)',2),
  head:P('M173 100 Q197 78 218 100 L225 128 208 156 184 149 172 128Z','#e2eff0')+E(188,123,5,3,'var(--dark)')+E(215,122,5,3,'var(--dark)'),
  hairFront:P('M167 126 Q145 82 187 69 Q227 58 235 109 L221 137 212 98 197 113 184 94Z','var(--accent)')+P('M177 86 L166 47 190 71 206 42 218 80Z','var(--main)','var(--accent)',2),
  wingBack:[-48,-18,35].map(a=>group(P('M0 0 L-20 -80 0 -131 18 -67Z','var(--main)','var(--accent)',2),`translate(153 211) rotate(${a})`)).join(''),
  weapon:L('M286 397 L290 114','var(--accent)',7)+P('M290 45 L318 89 289 133 264 89Z','var(--main)','var(--accent)',4)+star(290,87,22,'#efffff'), cape:'',
 }),
 H016:()=>({
  torso:P('M150 171 L190 146 226 165 244 235 218 284 245 406 197 384 151 412 159 286 130 221Z','var(--main)','var(--accent)',3)+P('M160 176 L192 226 224 166 222 208 191 261 158 215Z','var(--dark)')+L('M172 278 Q196 307 224 338 M164 322 Q195 348 229 375','var(--accent)',2),
  head:P('M171 96 L192 79 218 95 227 127 211 150 187 157 170 135Z','#bbbedb')+L('M183 120 L197 121 M212 120 L222 117','var(--accent)',3)+star(201,103,6),
  hairFront:P('M167 113 Q149 79 177 62 L218 66 237 96 220 123 206 85 186 101Z','var(--dark)'),
  halo:R(195,99,64,'var(--accent)',2)+group(R(0,0,49,'var(--accent)',2),'translate(195 99) scale(1.25 .5) rotate(30)')+[-55,15,90,165].map((a)=>star(195+Math.cos(a)*62,99+Math.sin(a)*62,8)).join(''),
  weapon:L('M289 413 L290 110','var(--accent)',7)+R(290,85,45,'var(--accent)',4)+group(R(0,0,31,'var(--main)',5),'translate(290 85) scale(1.5 .5) rotate(30)')+star(290,85,22),
  ribbon:L('M156 184 Q65 189 91 283 Q110 337 54 348 M220 176 Q277 139 304 179','var(--accent)',6),
 }),
 H017:()=>({
  torso:P('M155 163 L191 145 232 166 245 230 223 270 250 344 222 356 194 324 161 357 139 342 159 270 138 204Z','var(--dark)')+P('M161 178 L190 205 224 170 212 246 187 270 162 236Z','var(--main)','var(--accent)',3)+flame(194,235,.48),
  head:P('M167 102 L185 82 213 85 232 115 224 147 201 161 177 148Z','var(--main)')+E(190,122,6,4,'var(--accent)')+E(219,121,6,4,'var(--accent)'),
  hairFront:flame(173,121,.66,'var(--main)')+flame(206,102,.61)+blade('M173 93 L151 49 173 61 187 96Z')+blade('M220 94 L240 51 241 85Z'),
  wingBack:Array.from({length:7},(_,i)=>group(flame(0,0,1,'var(--main)'),`translate(${155-i*9} ${221+i*12}) rotate(${-42-i*10}) scale(.85)`)).join(''),
  wingFront:Array.from({length:5},(_,i)=>feather(226,218+i*15,65+i*10,.8,'var(--accent)')).join(''),
  weapon:L('M288 413 L284 121','var(--dark)',13)+L('M288 403 L286 137','var(--accent)',3)+P('M281 149 L255 105 267 64 288 94 313 52 325 105 302 149Z','var(--main)','var(--accent)',4)+flame(288,127,.56), cape:'',
 }),
 H018:()=>({
  torso:P('M156 169 Q192 147 225 171 L244 222 218 267 248 404 Q196 428 143 403 L164 271 137 220Z','var(--main)','var(--accent)',3)+P('M165 178 L192 228 219 175 215 236 194 258 169 232Z','var(--dark)')+L('M182 274 Q151 357 167 404 M208 276 Q238 354 220 405','var(--accent)',3),
  head:P('M172 103 Q193 81 218 98 L225 129 210 155 189 162 174 140Z','#e6d6d5')+L('M184 125 L195 123 M210 121 L220 124','var(--dark)',2),
  hairFront:P('M168 126 Q150 77 187 67 Q226 62 234 109 L221 134 212 96 191 108 181 96Z','var(--main)'),
  hairBack:P('M168 87 Q121 132 145 281 L162 323 178 167 M219 85 Q256 128 237 279 L215 298 212 158Z','var(--dark)'),
  halo:P('M211 30 A64 64 0 1 0 243 151 A55 55 0 0 1 211 30Z','var(--accent)','none'),
  weapon:P('M272 270 Q240 239 236 194 Q288 135 348 195 Q341 243 300 272 L285 251Z','var(--main)','var(--accent)',4)+P('M296 183 A32 32 0 1 0 318 236 A28 28 0 0 1 296 183Z','var(--dark)','var(--accent)',2)+L('M283 260 L251 202 M292 254 L327 201','var(--accent)',2),
  ribbon:L('M149 183 Q84 212 114 293 Q137 340 93 380 M222 177 Q278 228 256 324','var(--accent)',9), cape:'',
 }),
 H019:()=>({
  torso:P('M158 175 L190 157 220 176 232 227 208 267 245 327 215 357 186 330 157 360 126 333 159 267 142 211Z','var(--main)','var(--dark)',2)+petals(189,299,5,59,'var(--accent)')+P('M164 186 Q189 169 216 189 L206 243 188 263 168 239Z','var(--main)'),
  head:P('M166 104 Q193 82 219 104 L226 132 209 158 184 153 166 136Z','#e6e5c4')+E(186,127,5,3,'var(--dark)')+E(215,127,5,3,'var(--dark)'),
  hairFront:petals(195,91,7,49,'var(--accent)')+P('M164 120 Q147 99 169 92 L182 100 196 91 210 103 229 94 233 122 212 111 193 116 178 109Z','var(--main)'),
  wingBack:petals(153,205,4,82,'var(--main)'),
  weapon:P('M272 270 Q231 240 246 203 Q287 169 343 213 Q342 254 292 275Z','var(--main)','var(--accent)',3)+L('M274 264 L301 214 M283 247 L260 221 M291 234 L323 223','var(--dark)',3)+petals(298,217,5,26,'var(--accent)'),
  ribbon:L('M155 186 Q106 237 133 299 Q160 349 99 364','var(--main)',7)+[0,1,2].map(i=>group(P('M0 0 Q-35 -8 -22 -30 Q4 -31 0 0Z','var(--accent)','none'),`translate(${117+i*13} ${235+i*42}) rotate(${i*40})`)).join(''), cape:'',
 }),
 H020:()=>({
  torso:P('M148 160 L185 143 225 160 244 225 215 269 237 336 197 319 161 342 142 315 157 266 128 203Z','var(--main)')+P('M154 178 L185 217 221 165 219 202 183 246 151 211Z','var(--dark)')+L('M160 273 L218 265','var(--accent)',9),
  head:P('M158 95 L181 68 216 83 232 105 224 130 279 145 225 150 208 174 176 155 157 129Z','var(--main)')+P('M220 125 L283 145 224 149Z','var(--dark)')+P('M170 113 L189 105 211 114 209 130 179 128Z','var(--accent)')+E(199,117,5,4,'#142734'),
  hairFront:[-25,0,20].map((a,i)=>feather(173+i*14,93,a,.43,'var(--dark)')).join(''),
  wingBack:Array.from({length:7},(_,i)=>feather(145,197+i*14,-55-i*6,.9,'var(--main)')).join(''),
  weapon:Array.from({length:9},(_,i)=>feather(286,271,-58+i*14,1.02,i%2?'var(--main)':'var(--dark)')).join('')+L('M285 261 L275 312','var(--accent)',8),
  ribbon:L('M151 171 Q80 129 99 226 L74 278','var(--accent)',10), cape:'',
 }),
};

const order=['halo','cape','tail','wingBack','hairBack','upperLegBack','lowerLegBack','footBack','upperArmBack','lowerArmBack','handBack','torso','upperLegFront','lowerLegFront','footFront','head','hairFront','upperArmFront','lowerArmFront','handFront','weapon','wingFront','ornament','ribbon','smoke'];
const pivots: Record<string,[number,number]>={head:[192,141],hairFront:[190,94],hairBack:[186,115],torso:[192,237],cape:[157,183],tail:[153,292],wingBack:[154,197],wingFront:[225,197],halo:[194,114],upperArmFront:[224,185],lowerArmFront:[251,232],handFront:[267,272],weapon:[277,270],upperArmBack:[153,188],lowerArmBack:[132,237],handBack:[122,276],upperLegFront:[210,311],lowerLegFront:[219,375],footFront:[232,447],upperLegBack:[164,309],lowerLegBack:[151,373],footBack:[145,450],ribbon:[160,180],ornament:[191,242],smoke:[188,353]};
for (const [id, profile] of Object.entries(profiles)) {
 const i=Number(id.slice(1))-1, [main,accent,dark]=profile.palette;
 const floating=profile.float>0, bird=['harpy','tengu'].includes(profile.silhouette), heavy=['mountain','tortoise'].includes(profile.silhouette);
 const base: Layers={
  hairBack:P('M172 91 L158 169 144 241 172 221 193 153Z','var(--dark)'),
  upperLegBack:P(heavy?'M138 298 L184 304 178 382 130 384 119 352Z':'M152 298 L185 303 174 375 145 383 137 346Z','var(--dark)','var(--accent)',3),
  lowerLegBack:P(bird?'M145 365 L169 369 148 407 157 451 145 463 133 409Z':'M144 363 L173 373 165 446 137 454 128 411Z'),
  footBack:P(bird?'M144 441 L160 451 145 465 119 471 115 461 137 450 107 455 113 445Z':'M132 439 L165 440 169 469 113 472 104 461Z','var(--dark)','var(--accent)',3),
  upperLegFront:P('M198 303 L226 296 239 366 210 385 194 346Z','var(--dark)','var(--accent)',3),
  lowerLegFront:P(bird?'M211 365 L234 364 219 405 235 448 224 459 205 408Z':'M211 364 L239 362 249 447 220 454 207 412Z'),
  footFront:P(bird?'M222 443 L238 448 242 459 266 464 267 474 237 470 230 462 219 471 211 466Z':'M219 442 L249 439 257 456 281 463 278 476 220 473Z','var(--dark)','var(--accent)',3),
  upperArmBack:P('M147 176 Q122 169 113 198 L118 242 141 246 162 191Z'),
  lowerArmBack:P('M117 230 L142 237 133 278 111 275Z','var(--dark)','var(--accent)',3),handBack:E(124,277,13,17,'var(--main)'),
  upperArmFront:P(heavy?'M220 164 L266 176 277 214 250 238 222 204Z':'M218 167 Q244 165 251 188 L263 228 240 239 219 197Z'),
  lowerArmFront:P('M243 224 L265 220 285 267 261 281 247 259Z','var(--dark)','var(--accent)',3)+L('M254 237 L274 235 M258 251 L281 250','var(--main)',4), handFront:E(272,275,13,16,'var(--main)'),
  ornament:P('M179 263 L203 263 197 321 186 333 178 316Z','var(--accent)'),
  ...art[id](),
 };
 if(floating) for(const name of ['upperLegBack','lowerLegBack','footBack','upperLegFront','lowerLegFront','footFront']) base[name]='';
 const style=`style="--main:${main};--accent:${accent};--dark:${dark};--moss:#527859"`;
 const defs=`<defs><linearGradient id="metal" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${accent}"/><stop offset=".27" stop-color="${main}"/><stop offset=".62" stop-color="${main}"/><stop offset="1" stop-color="${dark}"/></linearGradient><linearGradient id="blade" x1="0" x2="1"><stop stop-color="${dark}"/><stop offset=".42" stop-color="${accent}"/><stop offset=".48" stop-color="#f4f1d6"/><stop offset=".58" stop-color="${main}"/><stop offset="1" stop-color="${accent}"/></linearGradient><linearGradient id="spectral" x2="0" y2="1"><stop stop-color="${main}"/><stop offset=".6" stop-color="${main}" stop-opacity=".8"/><stop offset="1" stop-color="${accent}" stop-opacity=".06"/></linearGradient></defs>`;
 const names=order.filter(n=>base[n]);
 const transform=`translate(200 480) scale(${profile.width*.84} ${profile.height*.86}) translate(-200 -480)`;
 const layer=(n:string)=>`<g id="${n}" transform="${transform}">${n==='head'||n==='hairFront'?group(base[n],`translate(194 127) scale(${profile.headScale}) translate(-194 -127)`):base[n]}</g>`;
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="520" viewBox="0 0 400 520" ${style}>${defs}${names.map(layer).join('')}</svg>`;
 const dir=path.join(root,id);await fs.mkdir(dir,{recursive:true});
 await fs.writeFile(path.join(dir,'layers.svg'),svg);
 await fs.writeFile(path.join(dir,'portrait.webp'),await sharp(Buffer.from(svg.replaceAll('var(--main)',main).replaceAll('var(--accent)',accent).replaceAll('var(--dark)',dark).replaceAll('var(--moss)','#527859'))).resize(600,780).webp({quality:92}).toBuffer());
 const cols=5, rows=Math.ceil(names.length/cols);
 const atlas=`<svg xmlns="http://www.w3.org/2000/svg" width="${cols*200}" height="${rows*260}" viewBox="0 0 ${cols*400} ${rows*520}" ${style}>${defs}${names.map((n,j)=>`<g transform="translate(${j%cols*400} ${Math.floor(j/cols)*520})">${layer(n)}</g>`).join('')}</svg>`;
 await fs.writeFile(path.join(dir,'rig.webp'),await sharp(Buffer.from(atlas.replaceAll('var(--main)',main).replaceAll('var(--accent)',accent).replaceAll('var(--dark)',dark).replaceAll('var(--moss)','#527859'))).webp({lossless:true}).toBuffer());
 const layout=names.map((name,j)=>{const p=pivots[name]||[200,260];return{name,x:j%cols*200,y:Math.floor(j/cols)*260,width:200,height:260,pivot:[(200+(p[0]-200)*profile.width*.84)/2,(480+(p[1]-480)*profile.height*.86)/2],origin:[100,240]};});
 await fs.writeFile(path.join(dir,'rig-layout.json'),JSON.stringify(layout,null,2)+'\n');
}

// Forty hand-authored emblem compositions. All silhouettes are readable without text.
const shield=(x=100,y=110)=>P(`M${x-49} ${y-64} L${x} ${y-80} ${x+49} ${y-64} ${x+42} ${y+14} ${x} ${y+49} ${x-42} ${y+14}Z`,'url(#metal)','var(--accent)',5);
const sword=()=>blade('M89 168 L103 177 155 51 154 19 131 38Z')+L('M75 139 L118 156','var(--accent)',9);
const moon=(x=100,y=100,r=65)=>P(`M${x+18} ${y-r} A${r} ${r} 0 1 0 ${x+53} ${y+39} A${r*.88} ${r*.88} 0 0 1 ${x+18} ${y-r}Z`,'var(--accent)','none');
const arrow=(x=100,angle=25)=>group(L('M0 65 L0 -45','var(--accent)',9)+blade('M0 -75 L-19 -39 0 -47 19 -39Z')+P('M0 44 L-14 33 -14 55 0 66 14 55 14 33Z','var(--main)'),`translate(${x} 110) rotate(${angle})`);
const bolt=(x=100)=>P(`M${x+8} 20 L${x-39} 102 ${x-4} 95 ${x-22} 180 ${x+45} 78 ${x+10} 83 ${x+35} 20Z`,'var(--accent)','var(--main)',3);
const eye=()=>P('M24 106 Q96 39 176 106 Q102 158 24 106Z','var(--main)','var(--accent)',6)+E(103,102,22,32,'var(--accent)')+E(106,103,6,26,'var(--dark)');
const icons:Record<string,[string,string]>={
 H001:[shield(108,100)+P('M29 167 L73 146 105 157 161 143 177 164 149 176 57 180Z','var(--main)')+L('M42 44 L64 76 M155 27 L137 64','var(--accent)',7),P('M12 150 L52 36 92 96 132 25 186 153Z','var(--main)','var(--accent)',5)+group(shield(),'translate(44 45) scale(.6)')],
 H002:[L('M35 131 Q144 186 155 91 Q159 29 98 36 Q37 41 50 86 Q68 101 91 67 L110 81 131 68','var(--accent)',14)+E(118,62,5,4,'#efffff')+L('M23 159 Q80 123 160 165','var(--main)',8),shield()+R(100,100,72,'var(--main)',7)+L('M39 146 Q131 161 158 74','var(--accent)',9)],
 H003:[P('M24 131 L58 70 126 55 171 99 184 138 158 137 126 110 83 116 62 156 36 172Z','var(--main)','var(--accent)',5)+P('M63 77 L73 49 87 73 111 66 135 41 141 74 121 98 82 99Z','var(--main)')+L('M25 89 L63 93 M31 111 L61 114','var(--accent)',6),shield()+P('M59 68 L73 45 91 71 121 71 140 44 143 101 119 136 82 136 58 107Z','var(--main)','var(--dark)',4)+L('M73 89 L88 100 M129 88 L113 100 M84 122 L115 122','var(--dark)',6)],
 H004:[E(100,105,68,56,'var(--main)')+P('M72 70 L113 59 143 91 134 132 93 147 62 118Z','var(--dark)','var(--accent)',5)+L('M42 165 Q99 139 149 166','var(--accent)',7)+star(101,108,20),R(100,105,73,'var(--accent)',6)+[0,60,120].map(a=>group(P('M-28 -46 L28 -46 55 0 28 46 -28 46 -55 0Z','none','var(--main)',5),`translate(100 106) rotate(${a})`)).join('')],
 H005:[sword()+L('M28 127 Q41 38 150 46 Q178 58 160 75 L143 66 130 89','var(--main)',13),[-30,0,30].map((a,i)=>group(L('M35 141 Q101 19 164 57','var(--accent)',9-i*2),`rotate(${a} 100 100)`)).join('')+flame(122,150,.62)],
 H006:[sword()+bolt(85),shield()+bolt(105)+R(100,102,77,'var(--main)',5)],
 H007:[sword()+P('M35 72 L78 54 108 76 95 112 123 136 95 172 49 143Z','var(--main)','var(--accent)',5)+L('M77 72 L66 99 94 121 68 145','var(--dark)',7),P('M48 33 L157 42 134 83 163 111 57 97Z','var(--main)','var(--accent)',4)+L('M48 25 L48 172','var(--accent)',8)+group(sword(),'translate(25 18) scale(.85)')],
 H008:[sword()+flame(70,136,.8,'var(--main)'),[0,1,2,3].map(i=>group(L('M32 141 Q72 52 160 50','var(--accent)',6),`rotate(${i*31-30} 100 100)`)).join('')+flame(115,153,.5)],
 H009:[P('M39 114 L48 45 80 77 124 75 160 40 169 117 144 149 71 151Z','var(--dark)','var(--main)',5)+E(80,111,12,5,'var(--accent)')+E(134,111,12,5,'var(--accent)')+L('M27 166 L77 166 M120 166 L173 166','var(--accent)',5),moon()+blade('M62 162 Q137 147 142 72 Q165 155 80 179Z')+star(70,48,13)],
 H010:[R(100,103,63,'var(--main)',7)+P('M100 29 L157 126 44 126Z','none','var(--accent)',4)+P('M100 69 Q64 115 101 133 Q136 111 100 69Z','var(--main)','var(--accent)',3),moon()+E(100,96,42,43,'var(--dark)')+blade('M28 148 Q92 91 166 132 L152 155 Q92 134 39 175Z')],
 H011:[[55,100,145].map((x,i)=>group(blade('M0 54 L-9 20 -8 -29 0 -63 11 -28 8 20Z'),`translate(${x} ${112+(i%2)*-23}) rotate(24)`)).join(''),P('M54 148 L44 91 70 43 111 27 151 76 143 137 100 172Z','var(--dark)','var(--accent)',5)+P('M70 88 L123 72 117 125 92 142 75 121Z','var(--main)')+L('M151 118 L185 80','var(--accent)',8)],
 H012:[L('M23 73 Q59 30 101 61 Q150 29 178 77 M26 137 Q77 161 147 133','var(--main)',13)+arrow(106,35),[44,84,124,164].map((x,i)=>group(arrow(x,25),`translate(0 ${i%2*18-18}) scale(.88)`)).join('')+L('M26 173 L173 173','var(--main)',7)],
 H013:[[-30,0,30].map(a=>group(feather(100,170,a,.96,'var(--accent)'),`rotate(${a} 100 100)`)).join(''),eye()+feather(57,137,-60,.53,'var(--accent)')+feather(153,139,60,.53,'var(--accent)')],
 H014:[arrow(100,30)+[0,1,2,3,4,5].map(i=>group(L('M0 -48 L0 -78','var(--accent)',7),`translate(112 99) rotate(${i*60})`)).join(''),R(99,94,63,'var(--accent)',8)+E(99,94,53,53,'var(--dark)')+arrow(107,40)],
 H015:[arrow(105,32)+[0,60,120].map(a=>group(L('M0 -36 L0 36 M-12 -25 L0 -12 12 -25 M-12 25 L0 12 12 25','var(--accent)',3),`translate(52 68) rotate(${a})`)).join(''),[0,60,120].map(a=>group(L('M0 -76 L0 76 M-22 -50 L0 -28 22 -50 M-22 50 L0 28 22 50','var(--accent)',6),`translate(100 100) rotate(${a})`)).join('')+R(100,100,45,'var(--main)',4)],
 H016:[L('M22 143 L55 110 44 87 92 80 101 39 M91 82 L127 109 148 79 177 93 M127 107 L131 148 167 166','var(--accent)',9)+star(91,82,15),bolt()+R(102,145,58,'var(--main)',7)+star(107,38,19)],
 H017:[flame(89,174,1.34,'var(--main)')+E(105,117,38,39,'var(--accent)')+flame(98,155,.64,'#f9e4a7'),[40,96,154].map((x,i)=>L(`M${x+28} 27 L${x-8} ${104+i%2*26}`,'var(--accent)',10)+flame(x,171,.52,'var(--main)')).join('')],
 H018:[moon(103,81,53)+L('M28 153 Q100 109 173 153 M44 173 Q100 140 156 173','var(--main)',8)+star(102,139,18),shield()+moon(107,96,42)+R(100,105,76,'var(--main)',3)],
 H019:[petals(100,121,7,70,'var(--accent)')+P('M27 135 Q95 195 174 133 Q112 172 100 130 Q87 168 27 135Z','var(--main)'),petals(100,112,8,56,'#f4f6e9')+R(100,113,75,'var(--accent)',4)+[35,90,155].map(x=>star(x,47+(x%4)*10,10)).join('')],
 H020:[[-40,-20,0,20,40].map(a=>feather(99,163,a,1,'var(--main)')).join('')+L('M29 108 Q117 74 165 115 L145 94 M28 131 Q101 106 161 139','var(--accent)',6),L('M169 61 Q66 26 40 94 Q23 147 105 138 L75 119 M175 159 Q84 184 41 153','var(--accent)',11)+feather(142,158,65,.66,'var(--main)')],
};
for(const [id,pair] of Object.entries(icons))for(let i=0;i<2;i++){
 const [main,accent,dark]=profiles[id].palette;
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 200 200" style="--main:${main};--accent:${accent};--dark:${dark}"><defs><radialGradient id="bg"><stop stop-color="${main}"/><stop offset="1" stop-color="#10202e"/></radialGradient><linearGradient id="metal"><stop stop-color="${accent}"/><stop offset=".5" stop-color="${main}"/><stop offset="1" stop-color="${dark}"/></linearGradient><linearGradient id="blade"><stop stop-color="#f0edd7"/><stop offset=".5" stop-color="${accent}"/><stop offset="1" stop-color="${main}"/></linearGradient></defs><rect width="200" height="200" rx="18" fill="url(#bg)"/><rect x="7" y="7" width="186" height="186" rx="13" fill="none" stroke="${accent}" stroke-opacity=".4" stroke-width="2"/>${pair[i]}</svg>`;
 await fs.writeFile(path.join(root,id,`skill-${i+1}.webp`),await sharp(Buffer.from(svg.replaceAll('var(--main)',main).replaceAll('var(--accent)',accent).replaceAll('var(--dark)',dark).replaceAll('var(--moss)','#527859'))).webp({quality:94}).toBuffer());
}
console.log('Authored 20 distinct layered characters, per-character rig layouts and 40 skill emblems.');
