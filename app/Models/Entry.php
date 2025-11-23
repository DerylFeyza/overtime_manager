<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Entry extends Model
{
  use HasFactory;

  protected $fillable = [
    'person',
    'date',
    'start_time',
    'finish_time',
    'description',
    'status',
  ];

  protected $casts = [
    'date' => 'date',
    'start_time' => 'datetime:H:i',
    'finish_time' => 'datetime:H:i',
  ];
}
