<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lembur extends Model
{
  use HasFactory;

  protected $table = 'lembur';

  protected $fillable = [
    'person',
    'start_date',
    'finish_date',
    'description',
    'status',
  ];

  protected $casts = [
    'start_date' => 'datetime',
    'finish_date' => 'datetime',
  ];
}
